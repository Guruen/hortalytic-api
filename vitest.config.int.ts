import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// Integrationstests mod en rigtig TimescaleDB i Testcontainers. Kræver Docker.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.int-spec.ts'],
    globalSetup: ['./test/integration/global-setup.ts'],
    // Testene deler én database
    fileParallelism: false,
    hookTimeout: 180_000,
    testTimeout: 30_000,
  },
});
