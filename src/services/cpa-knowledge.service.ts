import fs from 'fs';
import path from 'path';

export type CpaNetwork = 'lospollos' | 'mylead';

export interface MacroTemplate {
  [key: string]: string;
}

export interface TrafficRuleSet {
  allowed: string[];
  prohibited: string[];
}

export interface FunnelBlueprint {
  type: string;
  steps: string[];
  conversion_trigger: string;
}

export interface ComplianceValidationResult {
  isCompliant: boolean;
  violations: string[];
  missingDisclaimers: string[];
  matchedRules: string[];
}

export class CpaKnowledgeService {
  private readonly knowledgeDir: string;

  constructor(customDir?: string) {
    if (customDir) {
      this.knowledgeDir = customDir;
      return;
    }

    const candidates = [
      path.resolve(process.cwd(), 'core/data/knowledge'),
      path.resolve(process.cwd(), 'data/knowledge'),
    ];

    const existing = candidates.find((dir) => fs.existsSync(dir));
    this.knowledgeDir = existing ?? candidates[0];
  }

  private getFileCandidates(network: CpaNetwork): string[] {
    return [
      path.join(this.knowledgeDir, `${network}_rules.json`),
      path.join(this.knowledgeDir, `${network}_manual.json`),
    ];
  }

  private readRulesFile(network: CpaNetwork): Record<string, unknown> {
    const candidates = this.getFileCandidates(network);
    const file = candidates.find((candidate) => fs.existsSync(candidate));

    if (!file) {
      throw new Error(`[CpaKnowledgeService] Missing knowledge file for ${network}. Checked: ${candidates.join(', ')}`);
    }

    return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>;
  }

  public getNetworkRules(network: CpaNetwork): Record<string, unknown> {
    const raw = this.readRulesFile(network) as Record<string, unknown>;

    const macroSyntax = (raw.macro_syntax ?? raw.macroSyntax ?? {}) as Record<string, string>;
    const trafficRules = (raw.traffic_rules ?? raw.trafficRules ?? raw.trafficPolicy ?? { allowed: [], prohibited: [] }) as TrafficRuleSet & { allowed?: string[]; prohibited?: string[]; banned?: string[] };
    const funnelBlueprint = (raw.funnel_blueprint ?? raw.funnel ?? {
      type: 'default',
      steps: [],
      conversion_trigger: '',
    }) as FunnelBlueprint & { name?: string; objective?: string; notes?: string[]; type?: string };
    const mandatoryDisclaimers = (raw.mandatory_disclaimers ?? raw.legalRequirements ?? raw.complianceChecklist ?? []) as string[];

    const normalizedFunnel = {
      name: funnelBlueprint.name ?? funnelBlueprint.type ?? 'default',
      type: funnelBlueprint.type ?? funnelBlueprint.name ?? 'default',
      steps: Array.isArray(funnelBlueprint.steps) ? funnelBlueprint.steps : [],
      objective: funnelBlueprint.objective ?? funnelBlueprint.conversion_trigger ?? '',
      notes: Array.isArray(funnelBlueprint.notes) ? funnelBlueprint.notes : [],
    };

    const legacyTrafficPolicy = {
      allowed: Array.isArray(trafficRules.allowed) ? trafficRules.allowed : [],
      banned: Array.isArray(trafficRules.banned) ? trafficRules.banned : (Array.isArray(trafficRules.prohibited) ? trafficRules.prohibited : []),
      prohibited: Array.isArray(trafficRules.prohibited) ? trafficRules.prohibited : [],
    };

    const compliance = [
      ...(Array.isArray(raw.compliance) ? raw.compliance : []).map((item) => ({
        level: (item as Record<string, unknown>).level ?? 'mandatory',
        rule: (item as Record<string, unknown>).rule ?? '',
        category: (item as Record<string, unknown>).category ?? 'policy',
      })),
      ...mandatoryDisclaimers.map((item) => ({
        level: 'mandatory',
        rule: item,
        category: 'disclaimer',
      })),
    ];

    return {
      network,
      verticals: Array.isArray(raw.verticals) ? raw.verticals : [],
      macro_syntax: macroSyntax,
      macroSyntax,
      traffic_rules: {
        allowed: trafficRules.allowed ?? [],
        prohibited: trafficRules.prohibited ?? [],
      },
      trafficPolicy: legacyTrafficPolicy,
      funnel: normalizedFunnel,
      funnel_blueprint: {
        ...normalizedFunnel,
        conversion_trigger: funnelBlueprint.conversion_trigger ?? normalizedFunnel.objective,
      },
      mandatory_disclaimers: mandatoryDisclaimers,
      compliance,
    };
  }

  public getComplianceDirectives(network: CpaNetwork): string[] {
    const rules = this.getNetworkRules(network) as {
      mandatory_disclaimers?: string[];
      traffic_rules?: { prohibited?: string[] };
      compliance?: Array<{ rule?: string }>;
    };

    const directives = Array.isArray(rules.compliance)
      ? rules.compliance
          .map((item) => item.rule)
          .filter((item): item is string => typeof item === 'string' && item.length > 0)
      : [];

    const base = [
      ...((Array.isArray(rules.mandatory_disclaimers) ? rules.mandatory_disclaimers : []) as string[]),
      ...((Array.isArray(rules.traffic_rules?.prohibited) ? rules.traffic_rules.prohibited : []) as string[]).map((value) => `Do not use prohibited tactic: ${value}`),
    ];

    return Array.from(new Set([...directives, ...base]));
  }

  public getRecommendedFunnel(network: CpaNetwork): { name: string; type: string; steps: string[]; objective: string; notes: string[] } {
    const rules = this.getNetworkRules(network) as {
      funnel?: { name?: string; type?: string; steps?: string[]; objective?: string; notes?: string[] };
      funnel_blueprint?: { name?: string; type?: string; steps?: string[]; objective?: string; notes?: string[]; conversion_trigger?: string };
    };
    const funnel = rules.funnel ?? rules.funnel_blueprint ?? {
      name: 'default',
      type: 'default',
      steps: [],
      objective: '',
      notes: [],
    };

    return {
      name: funnel.name ?? funnel.type ?? 'default',
      type: funnel.type ?? funnel.name ?? 'default',
      steps: Array.isArray(funnel.steps) ? funnel.steps : [],
      objective: funnel.objective ?? (funnel as any).conversion_trigger ?? '',
      notes: Array.isArray(funnel.notes) ? funnel.notes : [],
    };
  }

  public getMacroTemplate(network: CpaNetwork): MacroTemplate {
    const rules = this.getNetworkRules(network) as {
      macro_syntax?: Record<string, string>;
      macroSyntax?: Record<string, string>;
    };

    return rules.macro_syntax ?? rules.macroSyntax ?? {};
  }

  public getMandatoryDisclaimers(network: CpaNetwork): string[] {
    const rules = this.getNetworkRules(network) as {
      mandatory_disclaimers?: string[];
    };

    return Array.isArray(rules.mandatory_disclaimers) ? rules.mandatory_disclaimers : [];
  }

  public validateCompliance(network: CpaNetwork, creativeText: string): ComplianceValidationResult {
    const normalizedText = (creativeText ?? '').toLowerCase();
    const mandatoryDisclaimers = this.getMandatoryDisclaimers(network);
    const missingDisclaimers = mandatoryDisclaimers.filter((disclaimer) => {
      const keyword = disclaimer.toLowerCase();
      return !normalizedText.includes(keyword.toLowerCase().split(' ')[0]);
    });

    const violations: string[] = [];

    if (network === 'mylead') {
      const financeSignals = /(finance|crypto|trading|forex|investment|yield|vpn|software|risk|wallet)/i;
      if (financeSignals.test(creativeText)) {
        const hasRiskNotice = /(capital at risk|risk warning|risk disclosure|not financial advice|educational only|disclaimer)/i.test(creativeText);
        if (!hasRiskNotice) {
          violations.push('Missing risk disclaimer for finance/crypto/trading content.');
        }

        if (/(review|comparison|best|ranked|recommendation)/i.test(creativeText) && !/(ftc|affiliate disclosure|independent reviewer|independent review|disclosure)/i.test(creativeText)) {
          violations.push('Missing FTC / reviewer disclosure for review content.');
        }
      }

      if (/(guaranteed profit|guaranteed returns|100% profit|easy money|get rich quick|no risk)/i.test(creativeText)) {
        violations.push('Guaranteed profit claims are prohibited.');
      }

      if (/(misleading discount|save 100%|free money|discount scam)/i.test(creativeText)) {
        violations.push('Misleading discount language is prohibited.');
      }
    }

    if (network === 'lospollos') {
      if (/(bot traffic|incent|fake meetup|forced redirect|guaranteed match)/i.test(creativeText)) {
        violations.push('Bot, incentive, fake meetup, or forced redirect language is prohibited.');
      }

      if (/(18\+|age verification|community guidelines)/i.test(creativeText) === false) {
        missingDisclaimers.push('18+ Community Guidelines');
      }

      if (/(confidentiality notice|confidential)/i.test(creativeText) === false) {
        missingDisclaimers.push('Confidentiality Notice');
      }
    }

    const dedupedMissing = Array.from(new Set(missingDisclaimers));
    const dedupedViolations = Array.from(new Set(violations));

    return {
      isCompliant: dedupedMissing.length === 0 && dedupedViolations.length === 0,
      violations: dedupedViolations,
      missingDisclaimers: dedupedMissing,
      matchedRules: dedupedViolations.length === 0 ? ['network_rules_loaded', 'policy_check_passed'] : ['network_rules_loaded'],
    };
  }
}

export default CpaKnowledgeService;
