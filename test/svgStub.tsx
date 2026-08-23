import type { SVGProps } from 'react'

/**
 * Stand-in for SVG files imported as React components.
 *
 * The real build uses `@svgr/webpack` (see the `/\.svg$/` rule in
 * `next.config.js`) to turn `import Logo from '@/data/logo.svg'` into a
 * component. Vite instead resolves that import to a URL string, so rendering
 * `<Logo />` throws `InvalidCharacterError`. `vitest.config.mts` aliases
 * `\.svg$` to this module to restore component semantics in tests.
 *
 * Props are forwarded so `className`, `aria-*` and friends stay assertable.
 */
export default function SvgStub(props: SVGProps<SVGSVGElement>) {
  return <svg data-testid="svg-mock" {...props} />
}
