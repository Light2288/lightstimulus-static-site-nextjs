# Layered cube demonstration assets

The canonical source is [USDZ Validation Kit's layered-cube example](https://github.com/Light2288/usdz-validator/tree/main/Examples/layered-cube), inspected at commit `71df0a8`. The illustration, USDZ, editable USDA, and saved report belong to that example. This site preserves the original USDZ/report bytes and adds a browser GLB and its rendered poster. The model omits the illustration's magnifying glass and exterior glow.

## Identity and native validation

| Asset                         | SHA-256                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| Canonical illustration source | `74723d5ddd7017e0943882a3c9b35ef3aca4b137244007aaabbe4bc2804a256b` |
| Canonical editable USDA       | `802c1a05ee68ecc5fc5c1b716a19a5dd1e2a69161bd512a10da981dd1e8ca1c3` |
| `model.usdz` (530,905 bytes)  | `89ee36e574d27275387367e67199a24ab7b4d356325f2b5f1fdfa60f1f2297a3` |
| `validation.json`             | `605d9a93ecbdac350152de3065f615595db743187e18d92e28c48afc5481c77f` |
| `model.glb`                   | `285dad3b84a224d1bcd50cec335be80ef258654d93b2d3f08ae3bd9776a46d73` |

The retained report was captured October 29, 2026 by validator **0.2.0**, schema **1**, safety envelope **3**, with default **general-v1** and built-in budgets. The failure threshold is `error`, incomplete coverage is not accepted, sensitive details are excluded, and the external checker is unrequested. It records exit **0**, gate **pass**, complete requested native coverage, no native findings, and no operational errors. It was not rerun for this website change.

The package contains one stored `model.usdc` entry, no textures, and no external dependencies. The report accepts the original USDZ's declared package/reference/budget policy. It does not validate the GLB, geometry, visual quality, full USD conformance, renderer compatibility, or security; the example does not exercise texture checks on actual texture data.

To reproduce native validation after building the CLI, run from the validator repository root:

```sh
.build/release/usdz-validator validate Examples/layered-cube/model.usdz --format json
```

## External conversion and comparison — October 30, 2026

Conversion used Python **3.14.7** in an isolated environment. No Apple USD tools or conversion packages are website runtime dependencies. The complete resolved Python package set was:

```text
dataclasses-json==0.6.7
gltflib==1.0.13
marshmallow==3.26.2
mypy_extensions==1.1.0
numpy==2.5.4
packaging==26.3
typing-inspect==0.9.0
typing_extensions==4.16.0
usd-core==26.11
usd2gltf==0.3.5
```

From this site's repository root, with `validator_repo` pointing at the canonical validator checkout:

```sh
python3 -m venv /tmp/usdz-demo-conversion
/tmp/usdz-demo-conversion/bin/python -m pip install usd2gltf==0.3.5 usd-core==26.11 numpy==2.5.4 gltflib==1.0.13
/tmp/usdz-demo-conversion/bin/usd2gltf -i "$validator_repo/Examples/layered-cube/model.usdz" -o public/static/models/usdz-validator/layered-cube/model.glb
/tmp/usdz-demo-conversion/bin/python scripts/verify-usdz-demo.py --self-test
/tmp/usdz-demo-conversion/bin/python scripts/verify-usdz-demo.py --source "$validator_repo/Examples/layered-cube/model.usdz" --glb public/static/models/usdz-validator/layered-cube/model.glb --output /tmp/usdz-demo-comparison.json
```

The independent comparison reads the original USDZ through OpenUSD and decodes the GLB's actual vertex/index buffers separately. All **14 mesh identities**, **35,694 oriented triangles**, material bindings, base colors, roughness, metallic values, and opacity matched. Maximum observed world-space positional difference was **0 m**, within the **1×10⁻⁶ m** tolerance; material tolerance was **1×10⁻⁶**. Geometry/normals were finite. The meter-scale Y-up scene retains its approximately **0.20 m** bounds on each axis. Glass uses `BLEND`, alpha **0.10000000149011612**, and unchanged back-face culling. The GLB has no external resource URIs or required decoder extensions.

Eight comparator self-tests exercise matching cyclic triangle ordering and rejection of changed geometry, reversed winding, missing meshes, opaque glass, wrong alpha mode, external resources, and nonfinite normals.

Separate Chrome/model-viewer **4.4.0** review inspected camera azimuths **45°, 225°, and 135°**, polar angle **65°**, using the built-in neutral environment. The frame, pyramid, grid, both platforms, and translucent panels remained visible; the browser loaded without JavaScript errors. Lighting changes the apparent colors relative to historical SceneKit previews. USD IOR **1.45** is not exported by usd2gltf, so identical optical appearance is not promised. These are external demonstration checks, not validator results. Historical October 28 artwork/Quick Look observations remain separately documented in the canonical example.

The square poster was captured from the accepted GLB at the **45°/65°** view, 1200×1200, with the loading bar hidden. Both the poster and canonical illustration were processed through `npm run compress-images -- projects/usdz-validator-demo`; original bytes are retained under the corresponding `original-backups` directory. The responsive site images intentionally use the repository's normal PNG/WebP compression.

## License

The canonical illustration, model, scene, and report are MIT licensed, copyright 2026 USDZ Validation Kit contributors. The derived browser model/poster retain that attribution. See [the complete license notice](LICENSE.txt). External tooling names identify provenance; their implementations are not included or relicensed here.
