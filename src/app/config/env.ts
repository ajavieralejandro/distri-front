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
  VITE_ALLOW_CLEARTEXT: z.enum(['true', 'false']).optional(),
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
  allowCleartext: boolean;
  allowCleartextHttp: boolean;
};

type EnvSource = {
  VITE_API_URL?: string;
  VITE_APP_ENV?: string;
  VITE_DATA_SOURCE?: string;
  VITE_DEMO_MODE?: string;
  VITE_ALLOW_CLEARTEXT?: string;
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
    VITE_ALLOW_CLEARTEXT: source.VITE_ALLOW_CLEARTEXT,
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

  const {
    VITE_API_URL,
    VITE_APP_ENV,
    VITE_DATA_SOURCE,
    VITE_DEMO_MODE,
    VITE_ALLOW_CLEARTEXT,
  } = result.data;
  const allowCleartext = VITE_ALLOW_CLEARTEXT === 'true';

  return {
    apiUrl: VITE_API_URL.replace(/\/$/, ''),
    appEnv: VITE_APP_ENV,
    isDevelopment: VITE_APP_ENV === 'development',
    dataSource: VITE_DATA_SOURCE,
    isMockDataSource: VITE_DATA_SOURCE === 'mock',
    demoMode: VITE_DEMO_MODE,
    allowCleartext,
    allowCleartextHttp: cleartextAllowed(VITE_APP_ENV, allowCleartext),
  };
}

export function cleartextAllowed(appEnv: AppEnv, flag: boolean): boolean {
  if (appEnv === 'production') {
    return false;
  }
  if (flag) {
    return true;
  }
  return appEnv === 'development' || appEnv === 'test';
}

export const env = loadEnv({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  VITE_DATA_SOURCE: import.meta.env.VITE_DATA_SOURCE,
  VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE,
  VITE_ALLOW_CLEARTEXT: import.meta.env.VITE_ALLOW_CLEARTEXT,
});
