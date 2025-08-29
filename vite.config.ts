import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'lib/index.ts'),
        vite: resolve(__dirname, 'lib/vite/index.ts'),
      },
      formats: ['es'],
      name: 'DynamicConfig',
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: ['zod', 'fs', 'path', 'vite'],
      output: {
        globals: {
          zod: 'zod',
          fs: 'fs',
          path: 'path',
          vite: 'vite',
        },
      },
    },
  },
});
