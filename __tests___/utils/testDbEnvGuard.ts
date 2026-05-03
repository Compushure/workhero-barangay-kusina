const REQUIRED_REMOTE_SERVER_ENV_KEYS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const;

const OPTIONAL_BROWSER_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
] as const;

type GuardOptions = {
  requireBrowserKeys?: boolean;
};

function getMissingEnvKeys(requiredKeys: ReadonlyArray<string>) {
  return requiredKeys.filter((key) => !process.env[key]?.trim());
}

/**
 * Fails fast before remote integration tests start when required test DB
 * environment variables are missing.
 */
export function assertRemoteTestDbEnv(options: GuardOptions = {}): void {
  const requiredKeys = options.requireBrowserKeys
    ? [...REQUIRED_REMOTE_SERVER_ENV_KEYS, ...OPTIONAL_BROWSER_ENV_KEYS]
    : [...REQUIRED_REMOTE_SERVER_ENV_KEYS];

  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      `Remote integration tests must run with NODE_ENV=test (received: ${process.env.NODE_ENV || 'undefined'})`
    );
  }

  const missing = getMissingEnvKeys(requiredKeys);

  if (missing.length > 0) {
    throw new Error(
      [
        `Missing required remote-test environment variables: ${missing.join(', ')}`,
        'Ensure these values are defined in .env.test before running integration suites.',
      ].join('\n')
    );
  }
}

export const requiredRemoteTestDbEnvKeys = [...REQUIRED_REMOTE_SERVER_ENV_KEYS];
export const optionalRemoteTestDbEnvKeys = [...OPTIONAL_BROWSER_ENV_KEYS];
