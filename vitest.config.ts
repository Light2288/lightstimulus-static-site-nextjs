import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'node:url'

/**
 * Vitest configuration for the test harness.
 *
 * - `@vitejs/plugin-react-swc` transforms JSX/TSX with SWC (no Babel), which
 *   avoids the Babel peer-dependency conflicts in this project and mirrors
 *   Next.js's own SWC-based transforms.
 * - Vite's native `resolve.tsconfigPaths` resolves ALL aliases from
 *   `tsconfig.json` (`@/components/*`, `@/lib/*`, `@/contexts/*`, `@/app/*`,
 *   `@/locales/*`, ...), so test imports stay in sync with the app
 *   automatically.
 * - `contentlayer/generated` is aliased explicitly below. If the generated
 *   output is ever absent on the test path, swap this alias to a lightweight
 *   stub module — no test currently imports it, so collection is unaffected.
 * - ESM-only packages used by client components are inlined so they are
 *   transformed rather than loaded raw (mirrors `transpilePackages` in
 *   `next.config.js`).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      'contentlayer/generated': fileURLToPath(
        new URL('./.contentlayer/generated', import.meta.url)
      ),
    },
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
