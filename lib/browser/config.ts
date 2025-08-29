// Generic config store that works with any config type
let _config: unknown = null;

export function setConfig<T>(config: T): void {
  _config = config;
}

export function getConfig<T>(): T {
  if (!_config) {
    throw new Error(
      'Configuration has not been loaded yet. Make sure to call initConfig() first.'
    );
  }
  return _config as T;
}

export const isConfigLoaded = (): boolean => {
  return _config !== null;
};
