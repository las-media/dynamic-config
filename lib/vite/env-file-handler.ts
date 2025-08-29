import fs from 'fs';
import path from 'path';
import { pluginConfig } from './config';
import type { DynamicConfigOptions, EnvFileConfig } from './types';

/**
 * Normalizes env file configuration to standard format
 */
export function normalizeEnvFileConfig(
  envFile: string | undefined
): EnvFileConfig | null {
  if (!envFile) {
    // No env file copying if not specified
    return null;
  }

  // Extract filename from source path
  const filename = path.basename(envFile);

  return {
    source: envFile,
    target: filename,
  };
}

/**
 * Copies env file to target directory during build
 */
export function copyEnvFile(envConfig: EnvFileConfig, outDir: string): void {
  const sourcePath = path.resolve(envConfig.source);
  const targetPath = path.join(outDir, envConfig.target);

  try {
    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️ Env file not found: ${sourcePath}`);
      return;
    }

    // Ensure target directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Copy file
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copied env file: ${envConfig.source} → ${targetPath}`);
  } catch (error) {
    console.error(`❌ Failed to copy env file:`, error);
  }
}

/**
 * Adds env file to Vite assets during build
 */
function addEnvFileToAssets(
  envConfig: EnvFileConfig
): { [fileName: string]: string } | null {
  const sourcePath = path.resolve(envConfig.source);

  try {
    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️ Env file not found: ${sourcePath}`);
      return null;
    }

    const content = fs.readFileSync(sourcePath, 'utf8');
    return {
      [envConfig.target]: content,
    };
  } catch (error) {
    console.error(`❌ Failed to read env file:`, error);
    return null;
  }
}

function ensureTrailingSlash(dir: string): string {
  return dir.endsWith('/') ? dir : dir + '/';
}

function normalizedIDir(
  configJsonDir: string,
  configJsonFileName: string
): string {
  return ensureTrailingSlash(configJsonDir) + configJsonFileName;
}

/**
 * Handles adding environment files to the bundle
 */
export function handleEnvFileBundle(
  plugin: {
    emitFile: (file: {
      type: 'asset';
      fileName: string;
      source: string;
    }) => void;
  },
  options: DynamicConfigOptions = {}
): void {
  const {
    configJsonDir = pluginConfig.DEFAULT_CONFIG_JSON_DIR,
    configJsonFileName = pluginConfig.DEFAULT_CONFIG_JSON_NAME,
  } = options;
  const envConfig = normalizeEnvFileConfig(
    normalizedIDir(configJsonDir, configJsonFileName)
  );

  if (!envConfig) {
    console.log(
      '📝 No env file configuration found - skipping env file bundle'
    );
    return;
  }

  console.log(
    `📦 Processing env file: ${envConfig.source} → ${envConfig.target}`
  );

  const envAssets = addEnvFileToAssets(envConfig);

  if (!envAssets) {
    console.warn('⚠️ Failed to process env file for bundle');
    return;
  }

  // Add each env file asset to the bundle
  Object.entries(envAssets).forEach(([fileName, content]) => {
    plugin.emitFile({
      type: 'asset',
      fileName,
      source: content,
    });
    console.log(`✅ Added env file to bundle: ${fileName}`);
  });
}
