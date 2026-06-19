import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['api/test/**/*.test.ts'],
    setupFiles: ['./api/test/setup.ts'],
  },
})
