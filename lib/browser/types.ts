export interface ConfigSources {
  json?: object;
  env?: object;
}

export type GenerateConfigFunction<T> = (sources: ConfigSources) => T;

export interface InitConfigOptions {
  /** URL to fetch JSON config from (default: '/env.json') */
  configUrl?: string;

  /** Whether to add cache busting timestamp (default: true) */
  cacheBusting?: boolean;

  /** Custom fetch options */
  fetchOptions?: RequestInit;

  env?: ImportMetaEnv;
}
