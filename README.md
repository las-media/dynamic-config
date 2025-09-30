# Dynamic Config

A TypeScript library for managing dynamic configuration in web applications with type safety and runtime validation using Zod schemas.

## Features

- 🔒 **Type-safe configuration** with Zod schema validation
- 🔄 **Dynamic runtime loading** from JSON files
- 🌍 **Environment variable integration**
- ⚡ **Vite plugin** for seamless build integration
- 🏗️ **Framework agnostic** - works with any frontend framework

## Installation

```bash
npm install @lasmedia/dynamic-config
# or
yarn add @lasmedia/dynamic-config
# or
pnpm add @lasmedia/dynamic-config
```

## Quick Start

### 1. Define Your Configuration

```typescript
import { z } from 'zod';
import { defineConfigEntry } from '@lasmedia/dynamic-config';

const appConfig = defineConfigEntry({
  name: 'app',
  schemaJson: z.object({
    apiUrl: z.string(),
    features: z.object({
      darkMode: z.boolean().default(false),
    }),
  }),
  schemaEnv: z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    DEBUG: z.string().optional(),
  }),
  config: (data) => ({
    apiEndpoint: data.apiUrl,
    isDevelopment: data.NODE_ENV === 'development',
    isDebugMode: data.DEBUG === 'true',
    features: data.features,
  }),
});
```

### 2. Setup Vite Plugin

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { dynamicConfig } from '@lasmedia/dynamic-config/vite';

export default defineConfig({
  plugins: [
    dynamicConfig({
      definitionDirs: ['src/config'], // Where to find config definitions
      configJsonDir: './', // Directory for JSON config file
      configJsonFileName: 'env.json', // Config file name
    }),
  ],
});
```

### 3. Initialize Configuration at Runtime

```typescript
import { initConfig, getConfig } from '@lasmedia/dynamic-config';
import { generateConfig } from './dynamicConfig.gen.ts';

// Initialize configuration from remote source
await initConfig(generateConfig, {
  env: import.meta.env,
});

// Access configuration anywhere in your app
const config = getConfig();
console.log(config.app.apiEndpoint);
```

## Core Functions

### `defineConfigEntry`

Creates a type-safe configuration entry that combines JSON and environment variable sources.

```typescript
const config = defineConfigEntry({
  name: 'myConfig',
  schemaJson: z.object({
    /* JSON schema */
  }),
  schemaEnv: z.object({
    /* ENV schema */
  }),
  config: (data) => ({
    /* transform function */
  }),
});
```

### `initConfig`

Loads configuration from a remote JSON source and .env file and applies validation and transformation.

```typescript
await initConfig(generateConfig, {
  configUrl: '/env.json',
  cacheBusting: true,
  fetchOptions: {},
  env: import.meta.env,
});
```

#### Options reference

| Option         | Type            | Default                                 | Description                                                                            | When to use                                                                          |
| -------------- | --------------- | --------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `configUrl`    | `string`        | `'/env.json'`                           | URL (relative or absolute) of the JSON config file to fetch at runtime.                | Your config file lives elsewhere / you renamed it.                                   |
| `cacheBusting` | `boolean`       | `true`                                  | Appends a `?t=TIMESTAMP` query param to avoid HTTP caching during development.         | Disable (set `false`) if you handle caching headers yourself.                        |
| `fetchOptions` | `RequestInit`   | `{}`                                    | Extra options merged into the `fetch` call (e.g. credentials, headers).                | You need auth headers, custom mode, etc.                                             |
| `env`          | `ImportMetaEnv` | `import.meta.env` snapshot at call time | Override or defer environment snapshot sourcing. Function form evaluated on each call. | HMR in dev mode on .env\* change is needed or custom environment injection in tests. |

### `getConfig` & `isConfigLoaded`

Access the loaded configuration and check if it's been initialized.

```typescript
const config = getConfig(); // Get current config
const loaded = isConfigLoaded(); // Check if config is loaded
```

### `dynamicConfig` (Vite Plugin)

Vite plugin that automatically discovers configuration definitions and handles build-time setup.

```typescript
dynamicConfig({
  definitionDirs: ['src/config'],
  configJsonDir: './',
  configJsonFileName: 'env.json',
});
```

#### Plugin options reference

| Option               | Type       | Default       | Description                                                                                       | When to change                                        |
| -------------------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `definitionDirs`     | `string[]` | `['src/env']` | Directories scanned recursively for `defineConfigEntry` calls.                                    | Your config files live elsewhere (e.g. `src/config`). |
| `configJsonDir`      | `string`   | `'./'`        | Output folder (relative to project root) where the runtime JSON config file is expected / copied. | You want the file in `public/` or a nested folder.    |
| `configJsonFileName` | `string`   | `'env.json'`  | Name of the runtime JSON config file served by the dev server / deployed statically.              | You prefer a different name like `app-config.json`.   |

Notes:

- The plugin generates a `dynamicConfig.gen.ts` file with a `generateConfig` export (do not edit manually).
- The JSON file (`env.json` by default) must be hosted so the browser can fetch it at runtime (`configUrl` in `initConfig`).
- If you change `configJsonDir` + `configJsonFileName`, keep `initConfig({ configUrl: '/yourName.json' })` consistent.

## Environment variables & HMR behavior (dev mode only)

Vite injects `import.meta.env` at module transform time. This means:

- Every module receives a snapshot of environment values at the moment it is (re)compiled.
- The object is NOT reactive; values do not change inside an already executed module.

By default `initConfig` reads `import.meta.env` when you call it. If you call it exactly once during application startup, the same snapshot will be kept until you fully reload the page. Restarting the dev server without a browser reload will usually NOT re-run the already cached module in the tab. (except using --force flag)

### Optional override / provider

You can pass a custom environment source via the `env` option:

```ts
await initConfig(generateConfig, {
  env: import.meta.env, // explicit snapshot now
});
```

### Do you need this?

Usually no. If you are fine with either:

- doing a full browser reload after changing `.env*` files, or
- running dev with `yarn dev --force`,

then the default behavior (no `env` option) is enough.

Use the `env` option only if you explicitly want to control when the snapshot is taken.

## Configuration Sources

The library supports two main configuration sources:

- **JSON files** - External configuration loaded at runtime
- **Environment variables** - Build-time and runtime environment variables

Both sources are validated using Zod schemas and merged into a single configuration object.

## Example Project Structure

```
src/
├── config/
│   └── appConfig.ts      # App configuration definition
├── main.ts
└── ...
env.json                  # Runtime configuration file (root)
```

## License

MIT
