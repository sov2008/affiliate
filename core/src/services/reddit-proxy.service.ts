import { ProxyAgent, fetch as undiciFetch, RequestInit as UndiciRequestInit, Response as UndiciResponse } from 'undici';

let proxyAgentInstance: ProxyAgent | null = null;

export function isRedditProxyEnabled(): boolean {
  return (process.env.REDDIT_PROXY_ENABLED || '').toLowerCase() === 'true';
}

export function getRedditProxyUrl(): string {
  return process.env.REDDIT_PROXY_URL || '';
}

export function getRedditProxyAgent(): ProxyAgent | null {
  if (!isRedditProxyEnabled()) {
    return null;
  }
  const proxyUrl = getRedditProxyUrl();
  if (!proxyUrl) {
    return null;
  }
  if (!proxyAgentInstance) {
    proxyAgentInstance = new ProxyAgent(proxyUrl);
  }
  return proxyAgentInstance;
}

/**
 * Unified fetch client for Reddit API calls.
 * Transparently routes through Webshare ProxyAgent when REDDIT_PROXY_ENABLED="true".
 */
export async function redditFetch(
  url: string | URL,
  init?: UndiciRequestInit
): Promise<UndiciResponse> {
  const agent = getRedditProxyAgent();
  const options: UndiciRequestInit = {
    ...init,
  };
  if (agent) {
    options.dispatcher = agent;
  }
  return undiciFetch(url, options);
}
