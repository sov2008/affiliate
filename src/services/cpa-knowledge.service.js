"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpaKnowledgeService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class CpaKnowledgeService {
    knowledgeDir;
    constructor(customDir) {
        if (customDir) {
            this.knowledgeDir = customDir;
            return;
        }
        const candidates = [
            path_1.default.resolve(process.cwd(), 'core/data/knowledge'),
            path_1.default.resolve(process.cwd(), 'data/knowledge'),
        ];
        const existing = candidates.find((dir) => fs_1.default.existsSync(dir));
        this.knowledgeDir = existing ?? candidates[0];
    }
    getFileCandidates(network) {
        return [
            path_1.default.join(this.knowledgeDir, `${network}_rules.json`),
            path_1.default.join(this.knowledgeDir, `${network}_manual.json`),
        ];
    }
    readRulesFile(network) {
        const candidates = this.getFileCandidates(network);
        const file = candidates.find((candidate) => fs_1.default.existsSync(candidate));
        if (!file) {
            throw new Error(`[CpaKnowledgeService] Missing knowledge file for ${network}. Checked: ${candidates.join(', ')}`);
        }
        return JSON.parse(fs_1.default.readFileSync(file, 'utf8'));
    }
    getNetworkRules(network) {
        const raw = this.readRulesFile(network);
        const macroSyntax = (raw.macro_syntax ?? raw.macroSyntax ?? {});
        const trafficRules = (raw.traffic_rules ?? raw.trafficRules ?? raw.trafficPolicy ?? { allowed: [], prohibited: [] });
        const funnelBlueprint = (raw.funnel_blueprint ?? raw.funnel ?? {
            type: 'default',
            steps: [],
            conversion_trigger: '',
        });
        const mandatoryDisclaimers = (raw.mandatory_disclaimers ?? raw.legalRequirements ?? raw.complianceChecklist ?? []);
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
                level: item.level ?? 'mandatory',
                rule: item.rule ?? '',
                category: item.category ?? 'policy',
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
    getComplianceDirectives(network) {
        const rules = this.getNetworkRules(network);
        const directives = Array.isArray(rules.compliance)
            ? rules.compliance
                .map((item) => item.rule)
                .filter((item) => typeof item === 'string' && item.length > 0)
            : [];
        const base = [
            ...(Array.isArray(rules.mandatory_disclaimers) ? rules.mandatory_disclaimers : []),
            ...(Array.isArray(rules.traffic_rules?.prohibited) ? rules.traffic_rules.prohibited : []).map((value) => `Do not use prohibited tactic: ${value}`),
        ];
        return Array.from(new Set([...directives, ...base]));
    }
    getRecommendedFunnel(network) {
        const rules = this.getNetworkRules(network);
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
            objective: funnel.objective ?? funnel.conversion_trigger ?? '',
            notes: Array.isArray(funnel.notes) ? funnel.notes : [],
        };
    }
    getMacroTemplate(network) {
        const rules = this.getNetworkRules(network);
        return rules.macro_syntax ?? rules.macroSyntax ?? {};
    }
    getMandatoryDisclaimers(network) {
        const rules = this.getNetworkRules(network);
        return Array.isArray(rules.mandatory_disclaimers) ? rules.mandatory_disclaimers : [];
    }
    validateCompliance(network, creativeText) {
        const normalizedText = (creativeText ?? '').toLowerCase();
        const mandatoryDisclaimers = this.getMandatoryDisclaimers(network);
        const missingDisclaimers = mandatoryDisclaimers.filter((disclaimer) => {
            const keyword = disclaimer.toLowerCase();
            return !normalizedText.includes(keyword.toLowerCase().split(' ')[0]);
        });
        const violations = [];
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
exports.CpaKnowledgeService = CpaKnowledgeService;
exports.default = CpaKnowledgeService;
