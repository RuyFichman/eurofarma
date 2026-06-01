import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    testTimeout: 20000,
    // Integração toca o banco real: serializa para evitar conflito de estado.
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.test.ts', 'lib/**/*.d.ts'],
    },
  },
})
