import path from 'path';

/**
 * Sets up file watchers for TypeScript files in specified directories
 */
export function setupFileWatchers(
  server: { watcher: { add: (path: string) => void } },
  scanDirs: string[]
): void {
  scanDirs.forEach((dirPath) => {
    const resolvedDirPath = path.resolve(dirPath);
    server.watcher.add(path.join(resolvedDirPath, '**/*.ts'));
    server.watcher.add(path.join(resolvedDirPath, '**/*.tsx'));
  });
}
