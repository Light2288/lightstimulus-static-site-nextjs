import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

/**
 * Vitest configuration for the test harness.
 *
 * - `@vitejs/plugin-react-swc` transforms JSX/TSX with SWC (no Babel), which
 *   avoids the Babel peer-dependency conflicts in this project and mirrors
 *   Next.js's own SWC-based transforms.
 * - The test toolchain is pinned to the Vitest 2 / Vite 5 line on purpose:
 *   Vite 8 declares a strict `esbuild` peer (^0.27||^0.28) that conflicts
 *   with the app's pinned `esbuild@0.25.2` and breaks Netlify's bare
 *   `npm ci`. Vite 5 has no such peer, so `npm ci` resolves cleanly.
 * - Path aliases are derived directly from `tsconfig.json` (see
 *   `aliasFromTsconfig` below) so they stay in sync with the app while being
 *   fully deterministic across Vite versions. This is more reliable here than
 *   `vite-tsconfig-paths`, which failed to resolve some aliases (e.g.
 *   `@/app/*`, `@/contexts/*`) in this project's tsconfig.
 * - `contentlayer/generated` is aliased explicitly. If the generated output
 *   is ever absent on the test path, swap this alias to a lightweight stub
 *   module — no test currently imports it, so collection is unaffected.
 * - ESM-only packages used by client components are inlined so they are
 *   transformed rather than loaded raw (mirrors `transpilePackages` in
 *   `next.config.js`).
 */

/**
 * Build Vite `resolve.alias` entries from the `compilerOptions.paths` in
 * tsconfig.json. Each `@/x/*` → `x/*` mapping becomes a regex alias that
 * rewrites `@/x/<rest>` to `<absolute baseUrl>/x/<rest>`.
 */
function aliasFromTsconfig(): { find: RegExp; replacement: string }[] {
  const tsconfigPath = fileURLToPath(new URL('./tsconfig.json', import.meta.url))
  const json = JSON.parse(readFileSync(tsconfigPath, 'utf-8'))
  const baseUrl = fileURLToPath(new URL('./', import.meta.url))
  const paths: Record<string, string[]> = json.compilerOptions?.paths ?? {}

  const aliases: { find: RegExp; replacement: string }[] = []
  for (const [key, targets] of Object.entries(paths)) {
    const target = targets[0]
    if (key.endsWith('/*')) {
      const prefix = key.slice(0, -2) // e.g. "@/components"
      const targetPrefix = target.replace(/\/\*$/, '').replace(/^\.\//, '') // e.g. "components"
      aliases.push({
        find: new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(.*)$`),
        replacement: `${baseUrl}${targetPrefix}/$1`,
      })
    } else {
      // Exact mapping (e.g. "contentlayer/generated", "pliny/*" handled above).
      const targetPath = target.replace(/^\.\//, '')
      aliases.push({
        find: new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
        replacement: `${baseUrl}${targetPath}`,
      })
    }
  }
  // Longest prefixes first so e.g. `@/components/common/*` wins over
  // `@/components/*`.
  return aliases.sort((a, b) => b.find.source.length - a.find.source.length)
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^contentlayer\/generated$/,
        replacement: fileURLToPath(new URL('./.contentlayer/generated', import.meta.url)),
      },
      ...aliasFromTsconfig(),
    ],
  },
  test: {
    environment: 'jsdom',
    // A URL is required for jsdom to expose window.localStorage /
    // sessionStorage, which PreferencesService and the providers rely on.
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out', '.contentlayer', 'dist'],
    server: {
      deps: {
        // Inline ESM-only deps so jsdom can execute them without transform
        // errors. Mirrors `transpilePackages` in next.config.js plus the
        // animation libs used by 'use client' components.
        inline: ['motion', 'contentlayer2', 'next-contentlayer2', 'pliny', 'gsap'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // No thresholds: coverage is measured but never gates the suite.
    },
  },
})
