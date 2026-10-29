import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  act,
  fireEvent,
  renderWithProviders,
  screen,
  waitFor,
} from '../../test/renderWithProviders'
import * as languageContext from '@/contexts/LanguageContext'
import { mockFetch, restoreFetch } from '../../test/mockFetch'

class ViewerStub extends HTMLElement {
  cameraOrbit = '45deg 65deg auto'
  cameraTarget = '0m 0m 0m'
  interpolationDecay = 50
  a11y: Record<string, string> = {}
  jumpCameraToGoal = vi.fn()
}

let Subject: React.ComponentType
let webgl: boolean
let rejectImport: boolean
let importGate: Promise<void> | undefined
let engineEvaluation: ReturnType<typeof vi.fn>
let reducedMotion: boolean

async function loadSubject(basePath = '') {
  vi.resetModules()
  vi.stubEnv('BASE_PATH', basePath)
  vi.doMock('react', () => React)
  vi.doMock('@/contexts/LanguageContext', () => languageContext)
  vi.doMock('motion/react', () => ({ useReducedMotion: () => reducedMotion }))
  vi.doMock('@google/model-viewer', async () => {
    engineEvaluation()
    await importGate
    if (rejectImport) throw new Error('Engine chunk unavailable')
    return {}
  })
  Subject = (await import('./USDZAssetDemo')).default
}

function LanguageButton() {
  const { lang, switchLang } = languageContext.useLanguage()
  return <button onClick={() => switchLang(lang === 'en' ? 'it' : 'en')}>Switch language</button>
}

async function activate() {
  fireEvent.click(screen.getByRole('button', { name: 'Load 3D model' }))
  await waitFor(() => expect(document.querySelector('model-viewer')).not.toBeNull())
  return document.querySelector('model-viewer') as unknown as ViewerStub
}

beforeAll(() => {
  customElements.define('model-viewer', ViewerStub)
})

beforeEach(async () => {
  webgl = true
  rejectImport = false
  importGate = undefined
  reducedMotion = false
  engineEvaluation = vi.fn()
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: vi.fn(() => (webgl ? { getExtension: () => ({ loseContext: vi.fn() }) } : null)),
  })
  await loadSubject()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe('USDZAssetDemo', () => {
  it('preserves the loaded viewer through the real search provider on language change', async () => {
    mockFetch({ body: '[]' })
    try {
      const { user } = renderWithProviders(
        <>
          <Subject />
          <LanguageButton />
        </>,
        { withSearch: true }
      )
      const viewer = await activate()
      fireEvent(viewer, new Event('load'))
      await user.click(screen.getByRole('button', { name: 'Switch language' }))
      expect(document.querySelector('model-viewer')).toBe(viewer)
      expect(screen.getByRole('status')).toHaveTextContent('Modello 3D pronto')
    } finally {
      restoreFetch()
    }
  })
  it('renders the poster and canonical evidence without loading the engine/model', () => {
    renderWithProviders(<Subject />)
    expect(screen.getByRole('img', { name: /Static preview/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download USDZ' })).toHaveAttribute('download')
    expect(screen.getByRole('link', { name: 'Download JSON report' })).toHaveAttribute('download')
    expect(screen.getByText('general-v1', { selector: 'code' })).toBeInTheDocument()
    expect(engineEvaluation).not.toHaveBeenCalled()
    expect(document.querySelector('model-viewer')).toBeNull()
  })

  it('retains static narrative support, poster, details, and downloads in server HTML', () => {
    const html = renderToString(
      <languageContext.LanguageProvider>
        <Subject />
      </languageContext.LanguageProvider>
    )
    expect(html).toContain('poster.png')
    expect(html).toContain('<details')
    expect(html).toContain('model.usdz')
    expect(html).toContain('validation.json')
    expect(html).not.toContain('<model-viewer')
    expect(engineEvaluation).not.toHaveBeenCalled()
  })

  it('loads on activation, retains the poster while loading, and exposes controls on success', async () => {
    renderWithProviders(<Subject />)
    const viewer = await activate()
    expect(engineEvaluation).toHaveBeenCalledOnce()
    expect(viewer).toHaveAttribute('src', '/static/models/usdz-validator/layered-cube/model.glb')
    expect(viewer).toHaveAttribute('touch-action', 'pan-y')
    expect(viewer).toHaveAttribute('interaction-prompt', 'none')
    expect(viewer).not.toHaveAttribute('auto-rotate')
    expect(screen.getByRole('status')).toHaveTextContent('Loading 3D model')
    expect(screen.getByRole('img', { name: /Static preview/ })).toBeInTheDocument()
    fireEvent(viewer, new Event('load'))
    expect(screen.getByRole('status')).toHaveTextContent('3D model ready')
    expect(screen.getByRole('button', { name: 'Reset view' })).toBeEnabled()
  })

  it('shows a usable fallback when the rendering engine cannot load', async () => {
    rejectImport = true
    renderWithProviders(<Subject />)
    fireEvent.click(screen.getByRole('button', { name: 'Load 3D model' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load the 3D model')
    expect(screen.getByRole('button', { name: 'Retry 3D model' })).toBeEnabled()
    expect(screen.getByRole('link', { name: 'Download USDZ' })).toBeInTheDocument()
    expect(document.querySelector('model-viewer')).toBeNull()
  })

  it('reports unavailable WebGL without importing the engine', async () => {
    webgl = false
    renderWithProviders(<Subject />)
    fireEvent.click(screen.getByRole('button', { name: 'Load 3D model' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load the 3D model')
    expect(engineEvaluation).not.toHaveBeenCalled()
  })

  it('recovers from model failure and ignores events from the abandoned element', async () => {
    renderWithProviders(<Subject />)
    const oldViewer = await activate()
    fireEvent(oldViewer, new CustomEvent('error', { detail: { type: 'loadfailure' } }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Static preview/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry 3D model' }))
    await waitFor(() => expect(document.querySelector('model-viewer')).not.toBeNull())
    const viewer = document.querySelector('model-viewer')!
    expect(viewer).not.toBe(oldViewer)
    fireEvent(oldViewer, new Event('load'))
    expect(screen.getByRole('status')).toHaveTextContent('Loading 3D model')
    fireEvent(viewer, new Event('load'))
    expect(screen.getByRole('status')).toHaveTextContent('3D model ready')
  })

  it('times out a stalled import after 30 seconds and rejects its late completion', async () => {
    let resolveImport!: () => void
    importGate = new Promise<void>((resolve) => {
      resolveImport = resolve
    })
    vi.useFakeTimers()
    renderWithProviders(<Subject />)
    fireEvent.click(screen.getByRole('button', { name: 'Load 3D model' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30001)
    })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await act(async () => {
      resolveImport()
      await Promise.resolve()
    })
    expect(document.querySelector('model-viewer')).toBeNull()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('times out a stalled model and can retry it', async () => {
    renderWithProviders(<Subject />)
    await activate()
    vi.useFakeTimers()
    // Start a fresh attempt under fake timers.
    fireEvent(document.querySelector('model-viewer')!, new Event('error'))
    fireEvent.click(screen.getByRole('button', { name: 'Retry 3D model' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30001)
    })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry 3D model' })).toBeEnabled()
  })

  it('cleans up timeout and late import work when navigating away', async () => {
    let resolveImport!: () => void
    importGate = new Promise<void>((resolve) => {
      resolveImport = resolve
    })
    vi.useFakeTimers()
    const schedule = vi.spyOn(globalThis, 'setTimeout')
    const cancel = vi.spyOn(globalThis, 'clearTimeout')
    const { unmount } = renderWithProviders(<Subject />)
    fireEvent.click(screen.getByRole('button', { name: 'Load 3D model' }))
    const loadTimerIndex = schedule.mock.calls.findIndex((call) => call[1] === 30000)
    const loadTimer = schedule.mock.results[loadTimerIndex].value
    unmount()
    expect(cancel).toHaveBeenCalledWith(loadTimer)
    schedule.mockRestore()
    cancel.mockRestore()
    await act(async () => {
      resolveImport()
      await Promise.resolve()
    })
    expect(document.querySelector('model-viewer')).toBeNull()
  })

  it('preserves loading, camera, and element identity while translating controls', async () => {
    const { user } = renderWithProviders(
      <>
        <Subject />
        <LanguageButton />
      </>
    )
    const viewer = await activate()
    await user.click(screen.getByRole('button', { name: 'Switch language' }))
    expect(screen.getByRole('status')).toHaveTextContent('Caricamento del modello 3D')
    expect(document.querySelector('model-viewer')).toBe(viewer)
    fireEvent(viewer, new Event('load'))
    viewer.cameraOrbit = '123deg 70deg auto'
    await user.click(screen.getByRole('button', { name: 'Switch language' }))
    expect(viewer.cameraOrbit).toBe('123deg 70deg auto')
    expect(document.querySelector('model-viewer')).toBe(viewer)
    expect(engineEvaluation).toHaveBeenCalledOnce()
    expect(viewer.a11y.front).toBe('View from the front')
    await user.click(screen.getByRole('button', { name: 'Reset view' }))
    expect(viewer.cameraOrbit).toBe('45deg 65deg auto')
    expect(viewer.jumpCameraToGoal).toHaveBeenCalledOnce()
  })

  it('does not activate on a language switch and localizes camera accessibility', async () => {
    const { user } = renderWithProviders(
      <>
        <Subject />
        <LanguageButton />
      </>
    )
    await user.click(screen.getByRole('button', { name: 'Switch language' }))
    expect(engineEvaluation).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Carica il modello 3D' }))
    await waitFor(() => expect(document.querySelector('model-viewer')).not.toBeNull())
    expect((document.querySelector('model-viewer') as unknown as ViewerStub).a11y.front).toBe(
      'Vista frontale'
    )
  })

  it('disables camera interpolation under reduced motion', async () => {
    reducedMotion = true
    renderWithProviders(<Subject />)
    expect((await activate()).interpolationDecay).toBe(0)
  })

  it('works under Strict Mode with one viewer and cleaned-up listeners', async () => {
    renderWithProviders(
      <React.StrictMode>
        <Subject />
      </React.StrictMode>
    )
    const viewer = await activate()
    fireEvent(viewer, new Event('load'))
    expect(screen.getByRole('status')).toHaveTextContent('3D model ready')
    expect(document.querySelectorAll('model-viewer')).toHaveLength(1)
  })

  it('prefixes assets exactly once for subpath exports and keeps Quick Look separate', async () => {
    await loadSubject('/portfolio')
    renderWithProviders(<Subject />)
    expect(screen.getByRole('link', { name: 'Download USDZ' })).toHaveAttribute(
      'href',
      '/portfolio/static/models/usdz-validator/layered-cube/model.usdz'
    )
    expect(screen.getByRole('link', { name: 'Open in Apple Quick Look' })).toHaveAttribute(
      'rel',
      'ar'
    )
    expect(
      screen.getByRole('link', { name: 'Open in Apple Quick Look' }).firstElementChild?.tagName
    ).toBe('IMG')
    expect(await activate()).toHaveAttribute(
      'src',
      '/portfolio/static/models/usdz-validator/layered-cube/model.glb'
    )
  })
})
