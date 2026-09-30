import fs from 'fs';
import path from 'path';

export interface AutopilotConfig {
  autoPublishEnabled: boolean;
  autoApproveSnippets: boolean;
  maxAutoApproveRiskScore: number;
  postComplianceAuditEnabled: boolean;
  strictEnglishEnforced: boolean;
  lastUpdated: string;
}

const DEFAULT_CONFIG: AutopilotConfig = {
  autoPublishEnabled: true,
  autoApproveSnippets: true,
  maxAutoApproveRiskScore: 10,
  postComplianceAuditEnabled: true,
  strictEnglishEnforced: true,
  lastUpdated: new Date().toISOString(),
};

export class AutopilotStateService {
  private static instance: AutopilotStateService | null = null;
  private readonly configPath: string;
  private config: AutopilotConfig;

  private constructor() {
    const candidates = [
      path.resolve(process.cwd(), '.antigravity/autopilot_config.json'),
      path.resolve(process.cwd(), 'core/data/autopilot_config.json'),
      path.resolve(process.cwd(), 'data/autopilot_config.json'),
    ];

    this.configPath = candidates.find((p) => fs.existsSync(p)) || candidates[0];
    this.config = this.loadConfig();
  }

  public static getInstance(): AutopilotStateService {
    if (!this.instance) {
      this.instance = new AutopilotStateService();
    }
    return this.instance;
  }

  private loadConfig(): AutopilotConfig {
    if (fs.existsSync(this.configPath)) {
      try {
        const raw = fs.readFileSync(this.configPath, 'utf8');
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
        };
      } catch {}
    }

    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {}
    }

    this.saveConfig(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }

  private saveConfig(cfg: AutopilotConfig): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(cfg, null, 2), 'utf8');
    } catch {}
  }

  public getConfig(): AutopilotConfig {
    return { ...this.config };
  }

  public isAutoPublishEnabled(): boolean {
    return this.config.autoPublishEnabled === true;
  }

  public shouldAutoApproveSnippet(riskScore: number): boolean {
    if (!this.config.autoPublishEnabled || !this.config.autoApproveSnippets) {
      return false;
    }
    return riskScore <= this.config.maxAutoApproveRiskScore;
  }

  public setAutoPublish(enabled: boolean): AutopilotConfig {
    this.config.autoPublishEnabled = enabled;
    this.config.lastUpdated = new Date().toISOString();
    this.saveConfig(this.config);
    return { ...this.config };
  }

  public toggleAutoPublish(): boolean {
    this.config.autoPublishEnabled = !this.config.autoPublishEnabled;
    this.config.lastUpdated = new Date().toISOString();
    this.saveConfig(this.config);
    return this.config.autoPublishEnabled;
  }
}
