#!/usr/bin/env python3
"""Independently compare this example's USD scene and uncompressed GLB geometry."""

import argparse
import copy
import json
import hashlib
import math
import struct
import sys
import unittest
from pathlib import Path

POSITION_TOLERANCE = 1e-6
MATERIAL_TOLERANCE = 1e-6


def oriented_triangle(triangle):
    """Allow cyclic reindexing but preserve the authored winding."""
    vertices = [tuple(float(x) for x in v) for v in triangle]
    rotations = [vertices[i:] + vertices[:i] for i in range(3)]
    return min(rotations, key=lambda t: tuple(round(x, 6) for v in t for x in v))


def ordered_triangles(triangles):
    return sorted((oriented_triangle(t) for t in triangles),
                  key=lambda t: tuple(round(x, 6) for v in t for x in v))


def compare_meshes(source, converted, external=False):
    if external:
        raise ValueError('GLB must not reference external resources')
    if not source or source.keys() != converted.keys():
        raise ValueError('Mesh names/count differ')
    checks = []
    differences = []
    for name, expected in source.items():
        actual = converted[name]
        a, b = expected['triangles'], actual['triangles']
        if len(a) != len(b) or not a:
            raise ValueError(f'{name}: triangle counts differ or are empty')
        for mesh in (expected, actual):
            values = [x for t in mesh['triangles'] for v in t for x in v]
            normals = mesh['normals']
            if (not normals or not all(math.isfinite(x) for x in values) or
                    not all(math.isfinite(x) for n in normals for x in n)):
                raise ValueError(f'{name}: missing/nonfinite geometry or normals')
        a, b = ordered_triangles(a), ordered_triangles(b)
        error = max(abs(x - y) for ta, tb in zip(a, b)
                    for va, vb in zip(ta, tb) for x, y in zip(va, vb))
        if error > POSITION_TOLERANCE:
            raise ValueError(f'{name}: oriented triangle positions differ by {error} m')
        em, am = expected['material'], actual['material']
        if em['name'] != am['name']:
            raise ValueError(f'{name}: material binding differs')
        for key in ['roughness', 'metallic', 'opacity']:
            if not math.isfinite(am[key]) or abs(em[key] - am[key]) > MATERIAL_TOLERANCE:
                raise ValueError(f'{name}: {key} differs')
        if any(not math.isfinite(y) or abs(x - y) > MATERIAL_TOLERANCE
               for x, y in zip(em['color'], am['color'])):
            raise ValueError(f'{name}: base color differs')
        if em['opacity'] < 1 and am['alphaMode'] != 'BLEND':
            raise ValueError(f'{name}: translucent surface must use BLEND')
        if em['doubleSided'] != am['doubleSided']:
            differences.append(f'{name}: USD doubleSided={em["doubleSided"]}, '
                               f'GLB doubleSided={am["doubleSided"]}')
        checks.append({'name': name, 'triangles': len(a), 'maxPositionErrorMeters': error,
                       'material': am})
    return {'status': 'pass', 'meshCount': len(checks),
            'triangleCount': sum(c['triangles'] for c in checks),
            'positionToleranceMeters': POSITION_TOLERANCE,
            'materialTolerance': MATERIAL_TOLERANCE, 'meshes': checks,
            'appearanceDifferences': differences + ['USD IOR is not exported by usd2gltf.'],
            'boundary': 'External geometry/material comparison; not USDZ Validation Kit output.'}


def read_source(filename):
    from pxr import Usd, UsdGeom, UsdShade
    stage = Usd.Stage.Open(str(filename))
    if not stage or UsdGeom.GetStageMetersPerUnit(stage) != 1 or UsdGeom.GetStageUpAxis(stage) != 'Y':
        raise ValueError('Expected the canonical meter-scale Y-up scene')
    cache = UsdGeom.XformCache()
    result = {}
    for prim in stage.Traverse():
        if not prim.IsA(UsdGeom.Mesh):
            continue
        mesh = UsdGeom.Mesh(prim)
        transform = cache.GetLocalToWorldTransform(prim)
        points = [list(transform.Transform(p)) for p in mesh.GetPointsAttr().Get()]
        indices = list(mesh.GetFaceVertexIndicesAttr().Get())
        triangles, start = [], 0
        for count in mesh.GetFaceVertexCountsAttr().Get():
            face = indices[start:start + count]
            for i in range(1, count - 1):
                triangle = [points[face[0]], points[face[i]], points[face[i + 1]]]
                if mesh.GetOrientationAttr().Get() == 'leftHanded':
                    triangle.reverse()
                triangles.append(triangle)
            start += count
        material = UsdShade.MaterialBindingAPI(prim).ComputeBoundMaterial()[0]
        shader = material.ComputeSurfaceSource()[0]
        opacity = float(shader.GetInput('opacity').Get())
        name = prim.GetName()
        if name in result:
            raise ValueError(f'Duplicate mesh name: {name}')
        result[name] = {'triangles': triangles,
                        'normals': [list(v) for v in mesh.GetNormalsAttr().Get()],
                        'material': {
                            'name': material.GetPrim().GetName(),
                            'color': list(shader.GetInput('diffuseColor').Get()),
                            'roughness': float(shader.GetInput('roughness').Get()),
                            'metallic': float(shader.GetInput('metallic').Get()),
                            'opacity': opacity, 'alphaMode': 'BLEND' if opacity < 1 else 'OPAQUE',
                            'doubleSided': bool(mesh.GetDoubleSidedAttr().Get()),
                        }}
    if len(result) != 14:
        raise ValueError(f'Canonical source must contain 14 meshes, found {len(result)}')
    return result


def read_glb(filename):
    import numpy as np
    raw = Path(filename).read_bytes()
    if len(raw) < 20 or struct.unpack_from('<4sII', raw) != (b'glTF', 2, len(raw)):
        raise ValueError('Invalid GLB header')
    chunks, cursor = {}, 12
    while cursor < len(raw):
        length, kind = struct.unpack_from('<II', raw, cursor)
        cursor += 8
        chunks[kind] = raw[cursor:cursor + length]
        cursor += length
    document = json.loads(chunks[0x4E4F534A])
    binary = chunks[0x004E4942]
    if (any('uri' in b for b in document.get('buffers', [])) or
            any('uri' in i for i in document.get('images', []))):
        raise ValueError('GLB must not reference URI resources')
    if document.get('extensionsRequired'):
        raise ValueError('This uncompressed example must not require decoder extensions')

    def accessor(index):
        entry = document['accessors'][index]
        if 'sparse' in entry or entry.get('normalized'):
            raise ValueError('Sparse/normalized accessors are outside this comparison subset')
        view = document['bufferViews'][entry['bufferView']]
        dtype = np.dtype({5121: 'u1', 5123: '<u2', 5125: '<u4', 5126: '<f4'}[entry['componentType']])
        size = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[entry['type']]
        offset = view.get('byteOffset', 0) + entry.get('byteOffset', 0)
        stride = view.get('byteStride', size * dtype.itemsize)
        return np.ndarray((entry['count'], size), dtype=dtype, buffer=binary,
                          offset=offset, strides=(stride, dtype.itemsize)).copy()

    def matrix(node):
        if 'matrix' in node:
            return np.array(node['matrix']).reshape((4, 4), order='F')
        x, y, z, w = node.get('rotation', [0, 0, 0, 1])
        rotation = np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                             [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                             [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
        transform = np.eye(4)
        transform[:3, :3] = rotation @ np.diag(node.get('scale', [1, 1, 1]))
        transform[:3, 3] = node.get('translation', [0, 0, 0])
        return transform

    result = {}

    def visit(index, parent, ancestors):
        if index in ancestors:
            raise ValueError('Cyclic GLB node graph')
        node = document['nodes'][index]
        transform = parent @ matrix(node)
        if 'mesh' in node:
            mesh = document['meshes'][node['mesh']]
            name = mesh['name']
            if name in result:
                raise ValueError(f'Duplicate/instanced mesh name: {name}')
            triangles, normals, material_value = [], [], None
            for primitive in mesh['primitives']:
                if primitive.get('mode', 4) != 4:
                    raise ValueError('Expected triangle primitives')
                points = accessor(primitive['attributes']['POSITION'])
                points = (transform @ np.column_stack((points, np.ones(len(points)))).T).T[:, :3]
                ns = accessor(primitive['attributes']['NORMAL'])
                normals.extend((np.linalg.inv(transform[:3, :3]).T @ ns.T).T.tolist())
                indices = (accessor(primitive['indices']).reshape(-1) if 'indices' in primitive
                           else np.arange(len(points)))
                triangles.extend(points[indices].reshape((-1, 3, 3)).tolist())
                mat = document['materials'][primitive['material']]
                pbr = mat.get('pbrMetallicRoughness', {})
                color = pbr.get('baseColorFactor', [1, 1, 1, 1])
                value = {'name': mat['name'], 'color': color[:3], 'opacity': color[3],
                         'roughness': pbr.get('roughnessFactor', 1),
                         'metallic': pbr.get('metallicFactor', 1),
                         'alphaMode': mat.get('alphaMode', 'OPAQUE'),
                         'doubleSided': mat.get('doubleSided', False)}
                if material_value is not None and material_value != value:
                    raise ValueError('Multiple materials per mesh are outside this example')
                material_value = value
            result[name] = {'triangles': triangles, 'normals': normals, 'material': material_value}
        for child in node.get('children', []):
            visit(child, transform, ancestors | {index})

    for root in document['scenes'][document.get('scene', 0)]['nodes']:
        visit(root, np.eye(4), set())
    return result


class ComparisonTests(unittest.TestCase):
    def setUp(self):
        self.meshes = {'Panel': {
            'triangles': [[[0, 0, 0], [0.2, 0, 0], [0, 0.2, 0]]],
            'normals': [[0, 0, 1]] * 3,
            'material': {'name': 'Glass', 'color': [0.16, 0.43, 0.88],
                         'roughness': 0.12, 'metallic': 0, 'opacity': 0.1,
                         'alphaMode': 'BLEND', 'doubleSided': False},
        }}

    def test_equivalent_and_cyclic_triangle_order(self):
        candidate = copy.deepcopy(self.meshes)
        candidate['Panel']['triangles'][0] = [[0.2, 0, 0], [0, 0.2, 0], [0, 0, 0]]
        self.assertEqual(compare_meshes(self.meshes, candidate)['status'], 'pass')

    def test_changed_geometry(self):
        candidate = copy.deepcopy(self.meshes)
        candidate['Panel']['triangles'][0][0][0] = 0.01
        with self.assertRaises(ValueError):
            compare_meshes(self.meshes, candidate)

    def test_reversed_winding(self):
        candidate = copy.deepcopy(self.meshes)
        candidate['Panel']['triangles'][0].reverse()
        with self.assertRaises(ValueError):
            compare_meshes(self.meshes, candidate)

    def test_missing_mesh(self):
        with self.assertRaises(ValueError):
            compare_meshes(self.meshes, {})

    def test_opaque_glass(self):
        candidate = copy.deepcopy(self.meshes)
        candidate['Panel']['material']['opacity'] = 1
        with self.assertRaises(ValueError):
            compare_meshes(self.meshes, candidate)

    def test_wrong_alpha_mode(self):
        candidate = copy.deepcopy(self.meshes)
        candidate['Panel']['material']['alphaMode'] = 'OPAQUE'
        with self.assertRaises(ValueError):
            compare_meshes(self.meshes, candidate)

    def test_external_resource(self):
        with self.assertRaises(ValueError):
            compare_meshes(self.meshes, self.meshes, external=True)

    def test_nonfinite_normals(self):
        candidate = copy.deepcopy(self.meshes)
        candidate['Panel']['normals'][0][0] = float('nan')
        with self.assertRaises(ValueError):
            compare_meshes(self.meshes, candidate)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--self-test', action='store_true')
    parser.add_argument('--source')
    parser.add_argument('--glb')
    parser.add_argument('--output')
    args = parser.parse_args()
    if args.self_test:
        unittest.main(argv=['verify-usdz-demo'], verbosity=2)
    else:
        if not all([args.source, args.glb, args.output]):
            parser.error('--source, --glb and --output are required')
        try:
            report = compare_meshes(read_source(args.source), read_glb(args.glb))
            report['sha256'] = {key: hashlib.sha256(Path(value).read_bytes()).hexdigest()
                                for key, value in [('source', args.source), ('glb', args.glb)]}
        except (ValueError, KeyError, IndexError, TypeError, OSError, struct.error) as error:
            Path(args.output).write_text(json.dumps({'status': 'fail', 'error': str(error)}, indent=2) + '\n')
            print(f'Comparison failed: {error}', file=sys.stderr)
            raise SystemExit(1) from error
        Path(args.output).write_text(json.dumps(report, indent=2) + '\n')
        print(f'PASS: {report["meshCount"]} meshes, {report["triangleCount"]} triangles; '
              'oriented geometry and material values preserved')
