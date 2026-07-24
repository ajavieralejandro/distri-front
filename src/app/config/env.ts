import { z } from 'zod';

const appEnvSchema = z.enum(['development', 'staging', 'production', 'test']);
const dataSourceSchema = z.enum(['mock', 'api']);
const booleanStringSchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const envSchema = z.object({
  VITE_API_URL: z
    .string()
    .min(1, 'VITE_API_URL is required')
    .url('VITE_API_URL must be a valid URL'),
  VITE_APP_ENV: appEnvSchema,
  VITE_DATA_SOURCE: dataSourceSchema,
  VITE_DEMO_MODE: booleanStringSchema,
});

export type AppEnv = z.infer<typeof appEnvSchema>;
export type DataSource = z.infer<typeof dataSourceSchema>;

export type AppConfig = {
  apiUrl: string;
  appEnv: AppEnv;
  isDevelopment: boolean;
  dataSource: DataSource;
  isMockDataSource: boolean;
  demoMode: boolean;
};

type EnvSource = {
  VITE_API_URL?: string;
  VITE_APP_ENV?: string;
  VITE_DATA_SOURCE?: string;
  VITE_DEMO_MODE?: string;
};

function formatEnvErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join('.') || 'env';
      return `- ${path}: ${issue.message}`;
    })
    .join('\n');
}

/**
 * Validates environment variables and returns a typed app config.
 * Throws a clear error if required values are missing or invalid.
 */
export function loadEnv(source: EnvSource): AppConfig {
  const result = envSchema.safeParse({
    VITE_API_URL: source.VITE_API_URL,
    VITE_APP_ENV: source.VITE_APP_ENV,
    VITE_DATA_SOURCE: source.VITE_DATA_SOURCE,
    VITE_DEMO_MODE: source.VITE_DEMO_MODE,
  });

  if (!result.success) {
    throw new Error(
      [
        'Invalid application environment configuration.',
        'Check your `.env` file against `.env.example`.',
        formatEnvErrors(result.error),
      ].join('\n'),
    );
  }

  const { VITE_API_URL, VITE_APP_ENV, VITE_DATA_SOURCE, VITE_DEMO_MODE } =
    result.data;

  return {
    apiUrl: VITE_API_URL.replace(/\/$/, ''),
    appEnv: VITE_APP_ENV,
    isDevelopment: VITE_APP_ENV === 'development',
    dataSource: VITE_DATA_SOURCE,
    isMockDataSource: VITE_DATA_SOURCE === 'mock',
    demoMode: VITE_DEMO_MODE,
  };
}

export const env = loadEnv({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  VITE_DATA_SOURCE: import.meta.env.VITE_DATA_SOURCE,
  VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE,
});
