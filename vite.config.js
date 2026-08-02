import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite 8 uses Rolldown, whose object-form `manualChunks` is unsupported.
// These explicit code-splitting groups are its manual-chunk equivalent and,
// unlike the compatibility function, do not recursively absorb dependencies.
const isPackage = (...packageNames) => (id) => {
  const normalizedId = id.replaceAll('\\', '/')

  return packageNames.some((packageName) =>
    normalizedId.includes(`/node_modules/${packageName}/`),
  )
}

const manualChunkGroups = [
  {
    name: 'vendor-drei',
    test: isPackage('@react-three/drei'),
    priority: 40,
    includeDependenciesRecursively: false,
    maxSize: 360_000,
  },
  {
    name: 'vendor-r3f',
    test: isPackage('@react-three/fiber'),
    priority: 40,
    includeDependenciesRecursively: false,
  },
  {
    name: 'vendor-three',
    test: isPackage('three'),
    priority: 40,
    includeDependenciesRecursively: false,
    maxSize: 450_000,
  },
  {
    name: 'vendor-react',
    test: isPackage('react', 'react-dom', 'scheduler'),
    priority: 30,
    includeDependenciesRecursively: false,
  },
  {
    name: 'vendor-three-support',
    test: isPackage(
      'three-stdlib',
      'maath',
      'camera-controls',
      'meshline',
      'troika-three-text',
    ),
    priority: 20,
    includeDependenciesRecursively: false,
    maxSize: 360_000,
  },
]

const normalizeBasePath = (basePath) => {
  if (!basePath) return '/'
  if (basePath === './') return './'

  const withLeadingSlash = basePath.startsWith('/')
    ? basePath
    : `/${basePath}`
  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash
    : `${withLeadingSlash}/`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    // Vercel and Netlify use `/`. GitHub Pages can set
    // VITE_BASE_PATH=/repository-name/ for production builds.
    base: normalizeBasePath(env.VITE_BASE_PATH),
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        preserveEntrySignatures: 'allow-extension',
        output: {
          // Required when explicit groups do not recursively absorb their
          // dependencies; this preserves ESM initialization order between
          // Drei, Fiber, and Three in production builds.
          strictExecutionOrder: true,
          codeSplitting: {
            includeDependenciesRecursively: false,
            maxSize: 450_000,
            groups: manualChunkGroups,
          },
        },
      },
    },
  }
})
