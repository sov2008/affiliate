import fs from 'fs/promises';
import path from 'path';

const MEMORY_FILE = path.resolve(__dirname, '../../.antigravity/memory.json');

interface MemoryStore {
  architectural_rules: Record<string, any>;
  deployed_campaigns: Record<string, any>;
  pipeline_preferences: Record<string, any>;
  web3_config: Record<string, any>;
  [key: string]: any;
}

const DEFAULT_MEMORY: MemoryStore = {
  architectural_rules: {
    styling: "Use Tailwind CSS via CDN",
    tracking: "Extract 'click_id', 'sub1', 'sub2' from URL and inject into CTA links"
  },
  deployed_campaigns: {},
  pipeline_preferences: {
    llm_provider: "gemini_direct",
    default_model: process.env.LLM_MODEL || "gemini-3.6-flash"
  },
  web3_config: {
    default_evm_payout_wallet: process.env.DEFAULT_EVM_PAYOUT_WALLET || "0x1796EaD42E41dDCB692fD82C8b71A7ec4FC8Adf1",
    supported_chains: process.env.SUPPORTED_PAYOUT_CHAINS ? process.env.SUPPORTED_PAYOUT_CHAINS.split(',') : ["BSC", "POLYGON", "ETHEREUM", "ARBITRUM"]
  }
};

async function loadMemory(): Promise<MemoryStore> {
  try {
    const data = await fs.readFile(MEMORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      await saveMemory(DEFAULT_MEMORY);
      return DEFAULT_MEMORY;
    }
    throw err;
  }
}

async function saveMemory(data: MemoryStore): Promise<void> {
  await fs.mkdir(path.dirname(MEMORY_FILE), { recursive: true });
  await fs.writeFile(MEMORY_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function remember(category: string, key: string, value: any): Promise<void> {
  const memory = await loadMemory();
  if (!memory[category]) {
    memory[category] = {};
  }
  memory[category][key] = value;
  await saveMemory(memory);
}

export async function recall(category?: string, query?: string): Promise<Record<string, any>> {
  const memory = await loadMemory();
  if (category && memory[category]) {
    // Simple exact match query if provided (could be expanded)
    if (query && memory[category][query]) {
      return { [query]: memory[category][query] };
    }
    return memory[category];
  }
  return memory;
}

export async function exportContextForPrompt(): Promise<string> {
  const memory = await loadMemory();
  let context = `[MEMORY CONTEXT]\n`;
  
  context += `Architectural Rules:\n`;
  for (const [key, val] of Object.entries(memory.architectural_rules || {})) {
    context += `- ${key}: ${JSON.stringify(val)}\n`;
  }
  
  context += `\nPipeline Preferences:\n`;
  for (const [key, val] of Object.entries(memory.pipeline_preferences || {})) {
    context += `- ${key}: ${JSON.stringify(val)}\n`;
  }
  
  if (memory.web3_config) {
    context += `\nWeb3 Configuration:\n`;
    for (const [key, val] of Object.entries(memory.web3_config)) {
      context += `- ${key}: ${JSON.stringify(val)}\n`;
    }
  }
  
  return context;
}

async function runCLI() {
  const args = process.argv.slice(2);
  
  if (args.includes('--show')) {
    const memory = await loadMemory();
    console.log(JSON.stringify(memory, null, 2));
  } else if (args.includes('--clear')) {
    await saveMemory(DEFAULT_MEMORY);
    console.log('Memory cleared and reset to defaults.');
  }
}

if (require.main === module) {
  runCLI().catch(console.error);
}
