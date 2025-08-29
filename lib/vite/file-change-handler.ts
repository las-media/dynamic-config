import { generateConfigFile } from './config-generator';
import { fileContainsCreateConfig } from './config-scanner';
import { DynamicConfigOptions } from './types';

/**
 * Checks if a file should trigger config regeneration
 */
function shouldRegenerateConfig(file: string): boolean {
  return (
    (file.endsWith('.ts') || file.endsWith('.tsx')) &&
    !file.includes('node_modules') &&
    !file.endsWith('.gen.ts')
  );
}

/**
 * Handles file change events and regenerates config if needed
 */
export function handleFileChange(
  file: string,
  options: DynamicConfigOptions
): void {
  if (!shouldRegenerateConfig(file)) {
    return;
  }

  // Check if the changed file contains defineConfigEntry
  if (fileContainsCreateConfig(file)) {
    generateConfigFile(options);
  }
}
