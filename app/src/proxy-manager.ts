import fs from "fs";
import path from "path";

// Dynamic imports for proxy agents to handle potential import issues
let HttpsProxyAgent: typeof import("https-proxy-agent").HttpsProxyAgent | null =
  null;
let SocksProxyAgent: typeof import("socks-proxy-agent").SocksProxyAgent | null =
  null;

// Initialize proxy agents
async function initializeProxyAgents(): Promise<void> {
  try {
    const httpsProxy = await import("https-proxy-agent");
    HttpsProxyAgent = httpsProxy.HttpsProxyAgent;

    const socksProxy = await import("socks-proxy-agent");
    SocksProxyAgent = socksProxy.SocksProxyAgent;
  } catch (error) {
    console.warn("Proxy agents not available:", error);
  }
}

interface ProxyConfig {
  url: string;
  type: "http" | "https" | "socks4" | "socks5";
  agent: unknown;
}

class ProxyManager {
  private proxies: string[] = [];
  private workingProxies: Set<string> = new Set();
  private failedProxies: Set<string> = new Set();
  private lastProxyCheck = 0;
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private initialized = false;

  constructor() {
    this.loadProxies();
    this.initializeAsync();
  }

  private async initializeAsync(): Promise<void> {
    if (!this.initialized) {
      await initializeProxyAgents();
      this.initialized = true;
    }
  }

  private loadProxies(): void {
    try {
      const proxiesPath = path.join(process.cwd(), "app/src/proxies.txt");
      const content = fs.readFileSync(proxiesPath, "utf-8");
      this.proxies = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .filter((line) => line.includes("://"));

      console.log(`Loaded ${this.proxies.length} proxies from proxies.txt`);
    } catch (error) {
      console.error("Failed to load proxies:", error);
      this.proxies = [];
    }
  }

  private createProxyAgent(proxyUrl: string): unknown {
    try {
      if (
        (proxyUrl.startsWith("http://") || proxyUrl.startsWith("https://")) &&
        HttpsProxyAgent
      ) {
        return new HttpsProxyAgent(proxyUrl);
      } else if (
        (proxyUrl.startsWith("socks4://") ||
          proxyUrl.startsWith("socks5://")) &&
        SocksProxyAgent
      ) {
        return new SocksProxyAgent(proxyUrl);
      }
      return null;
    } catch (error) {
      console.error(`Failed to create agent for proxy ${proxyUrl}:`, error);
      return null;
    }
  }

  public getRandomProxy(): ProxyConfig | null {
    if (this.proxies.length === 0) {
      return null;
    }

    // Clean failed proxies list periodically
    if (Date.now() - this.lastProxyCheck > this.CHECK_INTERVAL) {
      this.failedProxies.clear();
      this.lastProxyCheck = Date.now();
      console.log("Cleared failed proxies list");
    }

    // Filter available proxies (not in failed list)
    const availableProxies = this.proxies.filter(
      (proxy) => !this.failedProxies.has(proxy)
    );

    if (availableProxies.length === 0) {
      console.log("All proxies failed, clearing failed list and retrying");
      this.failedProxies.clear();
      return this.getRandomProxy();
    }

    // Get random proxy
    const randomIndex = Math.floor(Math.random() * availableProxies.length);
    const selectedProxy = availableProxies[randomIndex];

    const agent = this.createProxyAgent(selectedProxy);
    if (!agent) {
      this.markProxyAsFailed(selectedProxy);
      return this.getRandomProxy();
    }

    const type = selectedProxy.startsWith("socks4://")
      ? "socks4"
      : selectedProxy.startsWith("socks5://")
      ? "socks5"
      : selectedProxy.startsWith("https://")
      ? "https"
      : "http";

    return {
      url: selectedProxy,
      type,
      agent,
    };
  }

  public markProxyAsFailed(proxyUrl: string): void {
    this.failedProxies.add(proxyUrl);
    this.workingProxies.delete(proxyUrl);
    console.log(`Marked proxy as failed: ${proxyUrl}`);
  }

  public markProxyAsWorking(proxyUrl: string): void {
    this.workingProxies.add(proxyUrl);
    this.failedProxies.delete(proxyUrl);
  }

  public getStats(): {
    total: number;
    working: number;
    failed: number;
    available: number;
  } {
    return {
      total: this.proxies.length,
      working: this.workingProxies.size,
      failed: this.failedProxies.size,
      available: this.proxies.length - this.failedProxies.size,
    };
  }

  // Method to test a proxy
  public async testProxy(proxyUrl: string): Promise<boolean> {
    try {
      const agent = this.createProxyAgent(proxyUrl);
      if (!agent) return false;

      const testUrl = "https://httpbin.org/ip";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(testUrl, {
        method: "GET",
        // @ts-expect-error Agent type compatibility
        agent,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log(`Proxy ${proxyUrl} working, IP: ${data.origin}`);
        this.markProxyAsWorking(proxyUrl);
        return true;
      }
    } catch (error) {
      console.log(
        `Proxy ${proxyUrl} failed test:`,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    this.markProxyAsFailed(proxyUrl);
    return false;
  }
}

// Singleton instance
const proxyManager = new ProxyManager();

export default proxyManager;
export type { ProxyConfig };
