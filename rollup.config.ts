import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default [
  // Main entry point
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/index.es.js',
      format: 'es',
      sourcemap: true,
    },
    external: [
      ...Object.keys(pkg.peerDependencies || {}),
      'fs',
      'path',
      'vite',
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: true,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        outDir: 'dist',
        exclude: ['tests/**/*', '**/*.test.ts'],
      }),
      terser({
        compress: {
          drop_console: true,
        },
      }),
    ],
  },
  // Vite plugin entry point
  {
    input: 'lib/vite/index.ts',
    output: {
      file: 'dist/vite.es.js',
      format: 'es',
      sourcemap: true,
    },
    external: [
      ...Object.keys(pkg.peerDependencies || {}),
      'fs',
      'path',
      'vite',
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: true,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        outDir: 'dist',
        exclude: ['tests/**/*', '**/*.test.ts'],
      }),
      terser({
        compress: {
          drop_console: true,
        },
      }),
    ],
  },
];
