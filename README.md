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
npm install dynamic-config
# or
yarn add dynamic-config
# or
pnpm add dynamic-config
```

## Quick Start

### 1. Define Your Configuration

```typescript
import { z } from 'zod';
import { defineConfigEntry } from 'dynamic-config';

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
import { dynamicConfig } from 'dynamic-config/vite';

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
import { initConfig, getConfig } from 'dynamic-config';

// Initialize configuration from remote source
await initConfig(appConfig.parse, {
  configUrl: '/env.json',
  cacheBusting: true,
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

Loads configuration from a remote JSON source and applies validation and transformation.

```typescript
await initConfig(config.parse, {
  configUrl: '/env.json',
  cacheBusting: true,
  fetchOptions: {},
});
```

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
