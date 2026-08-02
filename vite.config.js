import { defineConfig } from 'vite'
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        codeSplitting: {
          includeDependenciesRecursively: false,
          maxSize: 450_000,
          groups: manualChunkGroups,
        },
      },
    },
  },
})
