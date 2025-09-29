import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default [
  // Main entry point
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/index.es.js',
      format: 'es',
    },
    plugins: [typescript(), terser()],
  },
  // Vite plugin entry point
  {
    input: 'lib/vite/index.ts',
    output: {
      file: 'dist/vite.es.js',
      format: 'es',
    },
    plugins: [nodeResolve(), typescript(), terser()],
  },
];
