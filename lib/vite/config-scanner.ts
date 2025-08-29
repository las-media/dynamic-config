import fs from 'fs';
import path from 'path';
import { pluginConfig } from './config';
import type { ConfigEntry, DynamicConfigOptions } from './types';

// Regex patterns - create new instances to avoid global state issues
const createDefineConfigPattern = () =>
  /export\s+const\s+(\w+)\s*=\s*defineConfigEntry\s*\(\s*\{/g;

/**
 * Cache for compiled regex patterns to avoid recompilation
 */
const regexCache = new Map<string, RegExp>();

/**
 * Gets or creates a cached regex pattern for extracting config names
 */
const getConfigNameRegex = (exportName: string): RegExp => {
  if (!regexCache.has(exportName)) {
    const pattern = new RegExp(
      `${exportName}\\s*=\\s*defineConfigEntry\\s*\\(\\s*\\{[^}]*name:\\s*['"](\\w+)['"]`,
      's'
    );
    regexCache.set(exportName, pattern);
  }
  return regexCache.get(exportName)!;
};

/**
 * Checks if a directory should be excluded from scanning
 */
const isExcludedDirectory = (dirName: string): boolean =>
  pluginConfig.EXCLUDED_DIRS.some((excluded) => dirName.includes(excluded));

/**
 * Optimized check for TypeScript files using Set for O(1) lookup
 */
const TS_EXTENSIONS_SET = new Set(['.ts', '.tsx']);
const isTypeScriptFile = (fileName: string): boolean => {
  const ext = path.extname(fileName);
  return TS_EXTENSIONS_SET.has(ext);
};

/**
 * Extracts config name from defineConfigEntry call content
 * Now receives content as parameter to avoid re-reading
 */
const extractConfigName = (content: string, exportName: string): string => {
  const configNameRegex = getConfigNameRegex(exportName);
  const match = configNameRegex.exec(content);
  return match ? match[1] : exportName;
};

/**
 * Creates a ConfigEntry from matched defineConfigEntry
 */
const createConfigEntry = (
  exportName: string,
  filePath: string,
  content: string
): ConfigEntry => ({
  name: extractConfigName(content, exportName),
  filePath: path.relative(process.cwd(), filePath),
  exportName,
});

/**
 * Scans a single file for defineConfigEntry calls
 */
const scanFileForConfigEntries = (filePath: string): ConfigEntry[] => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const entries: ConfigEntry[] = [];

    // Create fresh regex instance to avoid global state issues
    const defineConfigPattern = createDefineConfigPattern();
    let match;

    while ((match = defineConfigPattern.exec(content)) !== null) {
      const exportName = match[1];
      const entry = createConfigEntry(exportName, filePath, content);

      entries.push(entry);
    }

    return entries;
  } catch (error) {
    console.warn(`⚠️ Error reading file ${filePath}:`, error);
    return [];
  }
};

/**
 * Recursively scans a directory for TypeScript files
 */
const scanDirectory = (dirPath: string): ConfigEntry[] => {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries: ConfigEntry[] = [];
  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);

    if (item.isDirectory() && !isExcludedDirectory(item.name)) {
      entries.push(...scanDirectory(fullPath));
    } else if (item.isFile() && isTypeScriptFile(item.name)) {
      entries.push(...scanFileForConfigEntries(fullPath));
    }
  }

  return entries;
};

/**
 * Scans files for defineConfigEntry calls
 */
export function findDefineConfigCalls(
  options: DynamicConfigOptions = {}
): ConfigEntry[] {
  const { definitionDirs = pluginConfig.DEFAULT_DEFINITION_DIRS } = options;

  return definitionDirs.flatMap((dir) => {
    const fullPath = path.resolve(dir);
    return scanDirectory(fullPath);
  });
}

/**
 * Checks if file contains defineConfigEntry calls
 */
export function fileContainsCreateConfig(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes('defineConfigEntry');
  } catch (error) {
    console.debug('File temporarily unavailable:', filePath, error);
    return false;
  }
}
