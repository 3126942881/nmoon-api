// Internal export names are retained for existing consumers in the UI.
export const APIKEY_FUN_REGISTER_URL = 'https://ai.lmgai.cn/register';
export const APIKEY_FUN_DOCS_URL = 'https://ai.lmgai.cn';
export const APIKEY_FUN_GLOBAL_ENDPOINT = 'https://ai.lmgai.cn';
export const APIKEY_FUN_SOURCE_TAG = 'nmoon';
// A selectable preset; actual access still depends on the upstream API key.
export const APIKEY_FUN_DEFAULT_MODEL_CATALOG: readonly string[] = [
  'gpt-6.1-terra',
  'gpt-6.1-sol',
  'gpt-6-sol',
  'gpt-6-luna',
];

export function mergeApiKeyFunModelCatalog(
  current?: readonly string[] | null,
): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  // Defaults apply only to an unset catalog. An explicit list (including [])
  // belongs to the user or to the current key's model response.
  for (const raw of current ?? APIKEY_FUN_DEFAULT_MODEL_CATALOG) {
    const model = raw.trim();
    const key = model.toLowerCase();
    if (model && !seen.has(key)) {
      seen.add(key);
      result.push(model);
    }
  }
  return result;
}
export const APIKEY_FUN_PROVIDER_BASE_URL = buildApiKeyFunProviderBaseUrl(
  APIKEY_FUN_GLOBAL_ENDPOINT,
);

export function buildApiKeyFunProviderBaseUrl(endpoint: string): string {
  return `${endpoint.trim().replace(/\/+$/, '')}/v1`;
}

export function normalizeApiKeyFunOfficialUrl(value?: string | null): string {
  const raw = value?.trim() ?? '';
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    const hostname = parsed.hostname.toLowerCase();
    if (
      parsed.protocol === 'https:' &&
      hostname === 'ai.lmgai.cn' &&
      parsed.port === '' &&
      (parsed.pathname === '/' || parsed.pathname === '/register')
    ) {
      return APIKEY_FUN_REGISTER_URL;
    }
  } catch {
    return raw;
  }
  return raw;
}

export function isApiKeyFunProviderBaseUrl(value?: string | null): boolean {
  const raw = value?.trim() ?? '';
  if (!raw) return false;
  try {
    const parsed = new URL(raw);
    return [APIKEY_FUN_PROVIDER_BASE_URL].some(
      (candidate) => {
        const expected = new URL(candidate);
        return (
          parsed.protocol === expected.protocol &&
          parsed.hostname.toLowerCase() === expected.hostname.toLowerCase() &&
          parsed.port === expected.port &&
          parsed.pathname.replace(/\/+$/, '') === expected.pathname.replace(/\/+$/, '')
        );
      },
    );
  } catch {
    return false;
  }
}

export function normalizeApiKeyFunProviderBaseUrl(value?: string | null): string {
  const raw = value?.trim() ?? '';
  if (!raw) return raw;
  try {
    const parsed = new URL(raw);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/+$/, '')}`;
  } catch {
    return raw;
  }
}

export function resolveApiKeyFunWireApi(
  baseUrl?: string | null,
  wireApi?: 'responses' | 'chat_completions' | 'anthropic' | null,
): 'responses' | 'chat_completions' | 'anthropic' | null {
  return isApiKeyFunProviderBaseUrl(baseUrl) ? 'responses' : wireApi ?? null;
}
