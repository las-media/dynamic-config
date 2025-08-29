export interface EnvFileConfig {
  source: string;
  target: string;
}

export interface ConfigEntry {
  name: string;
  filePath: string;
  exportName: string;
}

export interface DynamicConfigOptions {
  /** Folders with config definitions (default: ['src/env']) */
  definitionDirs?: string[];
  /** Path to the env file to copy during build (default: './') */
  configJsonDir?: string;
  /** Name of the env file to copy during build (default: 'env.json') */
  configJsonFileName?: string;
}
