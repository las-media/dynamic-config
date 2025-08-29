import type { Plugin } from 'vite';
import { pluginConfig } from './config';
import { setupFileWatchers } from './config-file-watcher';
import { generateConfigFile } from './config-generator';
import { handleEnvFileBundle } from './env-file-handler';
import { handleFileChange } from './file-change-handler';
import type { DynamicConfigOptions } from './types';

// This module is intended ONLY for use in Node.js environments (e.g., vite.config.ts)
// DO NOT import this in browser/client code!
if (typeof window !== 'undefined') {
  throw new Error(
    'dynamic-config/vite is a Vite plugin and must not be imported in browser code!'
  );
}

/**
 * Vite plugin for automatic configuration generation
 */
export function dynamicConfig(options: DynamicConfigOptions = {}): Plugin {
  return {
    name: 'dynamic-config',
    buildStart() {
      generateConfigFile(options);
    },
    generateBundle() {
      handleEnvFileBundle(this, options);
    },
    configureServer(server) {
      const { definitionDirs = pluginConfig.DEFAULT_DEFINITION_DIRS } = options;

      // Setup file watchers for TypeScript files
      setupFileWatchers(server, definitionDirs);

      // Handle file changes
      server.watcher.on('change', (file) => {
        handleFileChange(file, options);
      });
    },
  };
}
