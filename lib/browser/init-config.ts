import { setConfig } from './config';
import type { GenerateConfigFunction, InitConfigOptions } from './types';

/**
 * Fetches configuration JSON from the specified URL
 */
async function getJsonSource(
  configUrl: string,
  cacheBusting: boolean,
  fetchOptions: RequestInit
) {
  const url = cacheBusting ? `${configUrl}?t=${Date.now()}` : configUrl;

  const res = await fetch(url, {
    cache: 'no-store',
    ...fetchOptions,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${configUrl}: ${res.status}`);
  }

  return res.json();
}

type ViteDummy = {
  env?: Record<string, unknown>;
  __VITE_ENV__?: Record<string, unknown>;
};

/**
 * Extracts environment variables from various sources depending on the runtime environment
 */
function getEnvironmentSource() {
  try {
    // Try to get import.meta.env directly (works in Vite/browser)
    return (import.meta as ViteDummy).env || {};
  } catch {
    // Fallback for environments where import.meta.env is not available
    try {
      return (globalThis as ViteDummy).__VITE_ENV__ || {};
    } catch {
      // Last fallback - check if it's exposed on window
      try {
        return typeof window !== 'undefined'
          ? (window as ViteDummy).__VITE_ENV__ || {}
          : {};
      } catch {
        return {};
      }
    }
  }
}

/**
 * Loads configuration from remote source and applies it using provided generateConfig function
 */
export async function initConfig<T>(
  generateConfig: GenerateConfigFunction<T>,
  options: InitConfigOptions = {}
): Promise<T> {
  const {
    configUrl = '/env.json',
    cacheBusting = true,
    fetchOptions = {},
  } = options;

  try {
    const configJson = await getJsonSource(
      configUrl,
      cacheBusting,
      fetchOptions
    );
    const envVars = getEnvironmentSource();

    const finalConfig = generateConfig({
      json: configJson,
      env: envVars,
    });

    setConfig(finalConfig);
    return finalConfig;
  } catch (error) {
    throw new Error(`Configuration loading failed: ${error}`);
  }
}
