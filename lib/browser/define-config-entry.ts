import type { ZodType, output } from 'zod';
import type { ConfigSources } from './types';

// Helper type to get the type from schema or empty object
type SchemaType<T> = T extends ZodType ? output<T> : object;

// Data sources type - flattened single object combining both schemas
type DataSources<
  TJsonSchema extends ZodType | undefined,
  TEnvSchema extends ZodType | undefined,
> = SchemaType<TJsonSchema> & SchemaType<TEnvSchema>;

// DefineConfig function type definition
type DefineConfigOptions<
  TJsonSchema extends ZodType | undefined,
  TEnvSchema extends ZodType | undefined,
  TConfig,
> = {
  name: string;
  schemaJson?: TJsonSchema;
  schemaEnv?: TEnvSchema;
  config: (source: DataSources<TJsonSchema, TEnvSchema>) => TConfig;
};

// DefineConfig result type
type DefineConfigResult<TConfig> = {
  name: string;
  parse: (sources: ConfigSources) => TConfig;
};

/**
 * Creates a type-safe configuration entry that combines JSON and environment variable sources.
 *
 * This function allows you to define a configuration with optional schemas for validation
 * and a transformation function that receives validated data from both JSON and environment sources.
 * The data is automatically parsed, validated, and merged into a single object for easy access.
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 *
 * const appConfig = defineConfigEntry({
 *   name: 'app',
 *   schemaJson: z.object({
 *     apiUrl: z.string()
 *   }),
 *   schemaEnv: z.object({
 *     DEBUG: z.string().optional()
 *   }),
 *   config: (data) => ({
 *     apiEndpoint: data.apiUrl,
 *     isDebugMode: data.DEBUG === 'true'
 *   })
 * });
 * ```
 */
export function defineConfigEntry<
  TJsonSchema extends ZodType | undefined,
  TEnvSchema extends ZodType | undefined,
  TConfig,
>(
  options: DefineConfigOptions<TJsonSchema, TEnvSchema, TConfig>
): DefineConfigResult<TConfig> {
  return {
    name: options.name,
    parse: (sources: ConfigSources) => {
      const parsedJson = options.schemaJson?.parse(sources.json ?? {});
      const parsedEnv = options.schemaEnv?.parse(sources.env ?? {});

      // Combine both parsed objects into one flattened object
      const combinedSource = {
        ...(typeof parsedJson === 'object' && parsedJson !== null
          ? parsedJson
          : {}),
        ...(typeof parsedEnv === 'object' && parsedEnv !== null
          ? parsedEnv
          : {}),
      } as DataSources<TJsonSchema, TEnvSchema>;

      return options.config(combinedSource);
    },
  };
}
