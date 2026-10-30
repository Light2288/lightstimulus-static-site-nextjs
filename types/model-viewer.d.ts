import type { DetailedHTMLProps, HTMLAttributes } from 'react'
import type { ModelViewerElement } from '@google/model-viewer'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<ModelViewerElement>, ModelViewerElement> & {
        src: string
        alt: string
        'camera-controls'?: boolean
        'disable-pan'?: boolean
        'camera-orbit'?: string
        'camera-target'?: string
        'environment-image'?: string
        'interaction-prompt'?: string
        'touch-action'?: string
        loading?: string
      }
    }
  }
}
