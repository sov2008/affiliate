import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
}

class ProxyRotator {
  private proxies: ProxyConfig[] = [];
  private currentIndex: number = 0;

  constructor() {
    this.reloadProxies();
  }

  public reloadProxies() {
    const rawPool = process.env.PROXY_POOL || '';
    this.proxies = rawPool
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => this.parseProxyUrl(p))
      .filter((p): p is ProxyConfig => p !== null);
  }

  private parseProxyUrl(raw: string): ProxyConfig | null {
    try {
      const url = new URL(raw.includes('://') ? raw : `http://${raw}`);
      const server = `${url.protocol}//${url.hostname}:${url.port}`;
      const username = url.username ? decodeURIComponent(url.username) : undefined;
      const password = url.password ? decodeURIComponent(url.password) : undefined;
      return { server, username, password };
    } catch {
      return null;
    }
  }

  public getNextProxy(): ProxyConfig | undefined {
    if (this.proxies.length === 0) return undefined;
    const proxy = this.proxies[this.currentIndex % this.proxies.length];
    this.currentIndex++;
    return proxy;
  }

  public getProxyCount(): number {
    return this.proxies.length;
  }
}

export const proxyRotator = new ProxyRotator();

if (require.main === module) {
  console.log('🔄 [Proxy Rotator Skill] Initialized.');
  console.log(`   Configured Proxies: ${proxyRotator.getProxyCount()}`);
  const next = proxyRotator.getNextProxy();
  console.log('   Next Proxy:', next || 'None (Direct Connection)');
}
