'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { ModelViewerElement } from '@google/model-viewer'
import { useReducedMotion } from 'motion/react'
import Image from '@/components/Image'
import { useLanguage } from '@/contexts/LanguageContext'
import report from '../../public/static/models/usdz-validator/layered-cube/validation.json'

const basePath = process.env.BASE_PATH || ''
const modelDirectory = `${basePath}/static/models/usdz-validator/layered-cube`
const imageDirectory = '/static/images/projects/usdz-validator-demo'
const initialOrbit = '45deg 65deg auto'
const cameraTarget = '0m 0m 0m'
const assetHash = '89ee36e574d27275387367e67199a24ab7b4d356325f2b5f1fdfa60f1f2297a3'
const loadTimeout = 30_000
let modelRequest = 0

export default function USDZAssetDemo(): React.JSX.Element {
  const { lang, t } = useLanguage()
  const reducedMotion = useReducedMotion()
  const instructionsId = useId()
  const [hydrated, setHydrated] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [renderAttempt, setRenderAttempt] = useState<number | null>(null)
  const [modelSource, setModelSource] = useState(`${modelDirectory}/model.glb`)
  const viewerRef = useRef<ModelViewerElement | null>(null)
  const attemptRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  const failAttempt = useCallback(
    (attempt: number) => {
      if (attemptRef.current !== attempt) return
      attemptRef.current += 1
      clearTimer()
      setRenderAttempt(null)
      setStatus('error')
    },
    [clearTimer]
  )

  useEffect(() => {
    setHydrated(true)
    return () => {
      attemptRef.current += 1
      clearTimer()
    }
  }, [clearTimer])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || renderAttempt === null) return
    const onLoad = () => {
      if (attemptRef.current !== renderAttempt) return
      clearTimer()
      setStatus('ready')
    }
    const onError = () => failAttempt(renderAttempt)
    viewer.addEventListener('load', onLoad)
    viewer.addEventListener('error', onError)
    // A cached asset can finish before React attaches this effect's listeners.
    if (viewer.loaded) onLoad()
    return () => {
      viewer.removeEventListener('load', onLoad)
      viewer.removeEventListener('error', onError)
    }
  }, [renderAttempt, clearTimer, failAttempt])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    viewer.interpolationDecay = reducedMotion ? 0 : 50
    viewer.a11y = {
      left: t('projects.usdzDemo.camera.left'),
      right: t('projects.usdzDemo.camera.right'),
      front: t('projects.usdzDemo.camera.front'),
      back: t('projects.usdzDemo.camera.back'),
      'upper-left': t('projects.usdzDemo.camera.upper-left'),
      'upper-right': t('projects.usdzDemo.camera.upper-right'),
      'upper-front': t('projects.usdzDemo.camera.upper-front'),
      'upper-back': t('projects.usdzDemo.camera.upper-back'),
      'lower-left': t('projects.usdzDemo.camera.lower-left'),
      'lower-right': t('projects.usdzDemo.camera.lower-right'),
      'lower-front': t('projects.usdzDemo.camera.lower-front'),
      'lower-back': t('projects.usdzDemo.camera.lower-back'),
      'interaction-prompt': t('projects.usdzDemo.camera.interaction-prompt'),
    }
  }, [renderAttempt, lang, reducedMotion, t])

  const activate = async () => {
    const attempt = ++attemptRef.current
    clearTimer()
    setRenderAttempt(null)
    // model-viewer caches failed and stalled loads by URL across element instances.
    // Retries and return navigation need fresh entries for the same asset bytes.
    const request = ++modelRequest
    setModelSource(`${modelDirectory}/model.glb${request > 1 ? `?attempt=${request}` : ''}`)
    setStatus('loading')
    timeoutRef.current = setTimeout(() => failAttempt(attempt), loadTimeout)
    try {
      const context = document.createElement('canvas').getContext('webgl2')
      if (!context) throw new Error('WebGL2 is unavailable')
      context.getExtension('WEBGL_lose_context')?.loseContext()
      // Event-handler import keeps the engine out of initial rendering and route prefetching.
      await import('@google/model-viewer')
      if (attemptRef.current === attempt) setRenderAttempt(attempt)
    } catch {
      // The localized fallback handles import/capability failure without losing the downloads.
      failAttempt(attempt)
    }
  }

  const resetView = () => {
    const viewer = viewerRef.current
    if (!viewer) return
    viewer.cameraOrbit = initialOrbit
    viewer.cameraTarget = cameraTarget
    viewer.jumpCameraToGoal()
  }

  return (
    <div className="not-prose my-8 space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <figure className="m-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="relative aspect-square bg-slate-50">
            <Image
              src={`${imageDirectory}/illustration.png`}
              alt={t('projects.usdzDemo.illustrationAlt')}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-contain p-3"
            />
          </div>
          <figcaption className="p-3 text-sm text-gray-700 dark:text-gray-300">
            {t('projects.usdzDemo.illustrationCaption')}
          </figcaption>
        </figure>
        <figure className="m-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="relative aspect-square bg-slate-50">
            {renderAttempt !== null && (
              <model-viewer
                key={renderAttempt}
                ref={viewerRef}
                src={modelSource}
                alt={t('projects.usdzDemo.modelAlt')}
                aria-describedby={instructionsId}
                camera-controls
                disable-pan
                camera-orbit={initialOrbit}
                camera-target={cameraTarget}
                environment-image="neutral"
                interaction-prompt="none"
                touch-action="pan-y"
                loading="eager"
                className="absolute inset-0 h-full w-full"
              >
                <div slot="progress-bar" hidden />
              </model-viewer>
            )}
            {status !== 'ready' && (
              <div className="pointer-events-none absolute inset-0">
                <Image
                  src={`${imageDirectory}/poster.png`}
                  alt={t('projects.usdzDemo.posterAlt')}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-contain"
                />
              </div>
            )}
            {(status === 'idle' || status === 'error') && (
              <div className="absolute inset-0 flex items-end justify-center p-4">
                <button
                  type="button"
                  onClick={activate}
                  disabled={!hydrated}
                  className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white shadow-md hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 disabled:opacity-60"
                >
                  {t(`projects.usdzDemo.${status === 'error' ? 'retry' : 'activate'}`)}
                </button>
              </div>
            )}
          </div>
          <figcaption className="p-3 text-sm text-gray-700 dark:text-gray-300">
            {t('projects.usdzDemo.modelCaption')}
          </figcaption>
        </figure>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <p role="status" aria-live="polite" className="m-0 text-gray-700 dark:text-gray-300">
          {t(`projects.usdzDemo.status.${status}`)}
        </p>
        <button
          type="button"
          onClick={resetView}
          disabled={status !== 'ready'}
          className="rounded-md border border-gray-400 px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-40"
        >
          {t('projects.usdzDemo.reset')}
        </button>
      </div>
      {status === 'error' && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {t('projects.usdzDemo.error')}
        </p>
      )}
      <p id={instructionsId} className="text-sm text-gray-600 dark:text-gray-400">
        {t('projects.usdzDemo.instructions')}
      </p>
      <noscript>
        <p>{t('projects.usdzDemo.noScript')}</p>
      </noscript>

      <p className="text-sm text-gray-800 dark:text-gray-200">
        <strong>{t('projects.usdzDemo.accepted')}</strong>
        {' · '}
        {report.tool.version}
        {' · '}
        <code>{report.configuration.profile}</code>
        {' · '}
        {t('projects.usdzDemo.summary')}
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-blue-700 dark:text-blue-300">
        <a href={`${modelDirectory}/model.usdz`} download="layered-cube.usdz">
          {t('projects.usdzDemo.downloadModel')}
        </a>
        <a href={`${modelDirectory}/validation.json`} download="layered-cube-validation.json">
          {t('projects.usdzDemo.downloadReport')}
        </a>
        <a
          href={`${modelDirectory}/model.usdz`}
          rel="ar"
          aria-label={t('projects.usdzDemo.quickLook')}
          className="inline-flex items-center gap-2"
        >
          {/* Quick Look requires an img as the first child of its native image link. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${basePath}${imageDirectory}/responsive/poster-144w.webp`}
            alt=""
            width={24}
            height={24}
            className="rounded"
          />
          <span>{t('projects.usdzDemo.quickLook')}</span>
        </a>
      </div>
      <details className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
        <summary className="cursor-pointer font-medium">
          {t('projects.usdzDemo.reportDetails')}
        </summary>
        <dl className="mt-4 grid gap-x-4 gap-y-2 sm:grid-cols-[auto_1fr]">
          <dt>{t('projects.usdzDemo.captured')}</dt>
          <dd>{t('projects.usdzDemo.captureDate')}</dd>
          <dt>{t('projects.usdzDemo.asset')}</dt>
          <dd>
            model.usdz · {report.input.byteSize.toLocaleString(lang)} {t('projects.usdzDemo.bytes')}
          </dd>
          <dt>SHA-256</dt>
          <dd className="font-mono text-xs break-all">{assetHash}</dd>
          <dt>{t('projects.usdzDemo.schema')}</dt>
          <dd>
            {report.schemaVersion} / {report.configuration.safetyEnvelopeVersion}
          </dd>
          <dt>{t('projects.usdzDemo.policy')}</dt>
          <dd>{t('projects.usdzDemo.policyValue')}</dd>
          <dt>{t('projects.usdzDemo.coverage')}</dt>
          <dd>{t('projects.usdzDemo.coverageValue')}</dd>
          <dt>{t('projects.usdzDemo.findings')}</dt>
          <dd>
            {report.nativeFindings.length} / {report.operationalErrors.length}
          </dd>
          <dt>{t('projects.usdzDemo.package')}</dt>
          <dd>{t('projects.usdzDemo.packageValue')}</dd>
          <dt>{t('projects.usdzDemo.checker')}</dt>
          <dd>{t('projects.usdzDemo.checkerValue')}</dd>
        </dl>
        <p className="mt-4">{t('projects.usdzDemo.boundary')}</p>
        <p className="mt-3">{t('projects.usdzDemo.quickLookNote')}</p>
        <p className="mt-3 text-blue-700 dark:text-blue-300">
          <a href={`${modelDirectory}/README.md`}>{t('projects.usdzDemo.provenance')}</a>
          {' · '}
          <a href={`${modelDirectory}/LICENSE.txt`}>
            MIT · © 2026 USDZ Validation Kit contributors
          </a>
        </p>
      </details>
    </div>
  )
}
