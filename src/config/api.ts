/**
 * API Configuration Module
 *
 * Manages API endpoint configuration for development vs production environments.
 *
 * Development Mode:
 * - Uses local proxy server (server.js) at localhost:3004
 * - API key stays server-side (more secure)
 * - Requires running `npm run server` alongside `npm run dev`
 *
 * Production Mode:
 * - Calls Anthropic API directly from browser
 * - API key embedded in build (acceptable for password-protected dashboard)
 * - No backend server needed (works on Siteground)
 *
 * Toggle via environment variable: VITE_USE_DIRECT_API
 * - Set to 'true' in .env.production
 * - Set to 'false' in .env.development
 */

export interface ApiConfig {
  mode: 'proxy' | 'direct';
  endpoint: string;
  requiresApiKey: boolean;
  description: string;
}

/**
 * Determines API mode based on environment variable
 * Defaults to 'proxy' mode if variable not set (safer for development)
 */
export function getApiMode(): 'proxy' | 'direct' {
  const useDirectApi = import.meta.env.VITE_USE_DIRECT_API === 'true';
  return useDirectApi ? 'direct' : 'proxy';
}

/**
 * Get API configuration based on current mode
 */
export function getApiConfig(): ApiConfig {
  const mode = getApiMode();

  if (mode === 'direct') {
    // Call Anthropic API directly from browser
    // API key is embedded in production build (acceptable for password-protected dashboard)
    const productionEndpoint = import.meta.env.VITE_API_ENDPOINT || 'https://api.anthropic.com/v1/messages';

    return {
      mode: 'direct',
      endpoint: productionEndpoint,
      requiresApiKey: true, // API key needed for direct calls
      description: 'Direct API calls to Anthropic (Production)',
    };
  }

  return {
    mode: 'proxy',
    endpoint: 'http://localhost:3004/api/chat',
    requiresApiKey: false,
    description: 'Proxy through local server (Development)',
  };
}

/**
 * Get API key from environment
 * Only required in direct mode
 */
export function getApiKey(): string | undefined {
  return import.meta.env.VITE_ANTHROPIC_API_KEY;
}

/**
 * Validate API configuration
 * Throws error if required configuration is missing
 */
export function validateApiConfig(): void {
  const config = getApiConfig();

  if (config.mode === 'direct') {
    const apiKey = getApiKey();
    if (!apiKey || apiKey === 'your-api-key-here') {
      throw new Error(
        'VITE_ANTHROPIC_API_KEY is required for direct API mode. ' +
        'Please set it in your .env.production file.'
      );
    }
  }

  console.log(`[API Config] Mode: ${config.mode}`);
  console.log(`[API Config] Endpoint: ${config.endpoint}`);
  console.log(`[API Config] Description: ${config.description}`);
}

/**
 * Make API call to Claude with automatic endpoint selection
 */
export async function callClaudeApi(params: {
  model: string;
  max_tokens: number;
  system: string;
  messages: Array<{ role: string; content: string }>;
}): Promise<Response> {
  const config = getApiConfig();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add API key for direct mode
  if (config.mode === 'direct' && config.requiresApiKey) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API key is required for direct API calls');
    }
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  }

  return fetch(config.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
}
