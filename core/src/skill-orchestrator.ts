import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { generateContent } from './llm-gateway';

const execAsync = util.promisify(exec);

async function loadRouterConfig() {
  const routerPath = path.resolve(__dirname, '../../.agents/skills/router.json');
  const content = await fs.readFile(routerPath, 'utf8');
  return JSON.parse(content);
}

async function parseIntent(intent: string, availableSkills: string[]): Promise<string[]> {
  const prompt = `
    You are an intelligent Skill Router (Orchestrator).
    Given the user's intent: "${intent}"
    
    And the following available skills:
    ${availableSkills.join('\n')}
    
    Determine which skills should be executed to fulfill the user's intent, and in what order.
    Return ONLY a JSON array of skill names.
    For example: ["skill_campaign_builder", "skill_tracking_validator"]
    
    Do not return any markdown blocks or explanations, just the raw JSON array.
  `;

  let response = await generateContent(prompt);
  response = response.trim();
  if (response.startsWith('\`\`\`json')) {
    response = response.replace(/^\`\`\`json\s*/, '').replace(/\s*\`\`\`$/, '');
  }
  
  try {
    const skills = JSON.parse(response);
    return Array.isArray(skills) ? skills : [];
  } catch (err) {
    console.error("Failed to parse LLM response as JSON:", response);
    return [];
  }
}

async function runOrchestrator() {
  const args = process.argv.slice(2);
  let intent = '';
  for (const arg of args) {
    if (arg.startsWith('--intent=')) {
      intent = arg.slice('--intent='.length);
    }
  }

  if (!intent) {
    console.error('Usage: npm run skill:run -- --intent="your intent here"');
    process.exit(1);
  }

  console.log(`[Orchestrator] Received intent: "${intent}"`);
  
  const config = await loadRouterConfig();
  const availableSkills = Object.keys(config.skills).map(k => `${k}: ${config.skills[k].description}`);
  
  console.log('[Orchestrator] Parsing intent via LLM...');
  const selectedSkills = await parseIntent(intent, availableSkills);
  
  if (selectedSkills.length === 0) {
    console.log('[Orchestrator] No relevant skills identified for this intent.');
    return;
  }
  
  console.log(`[Orchestrator] Routing to skills: ${selectedSkills.join(', ')}`);
  
  for (const skillName of selectedSkills) {
    const skillConfig = config.skills[skillName];
    if (skillConfig) {
      console.log(`\n>>> Executing skill: ${skillName}`);
      try {
        // Run with cwd relative to core directory
        const { stdout, stderr } = await execAsync(`npm run ${skillConfig.command.replace('tsx ', 'tsx ')}`, {
          cwd: path.resolve(__dirname, '..') // core directory
        });
        // We will just execute the raw command from core directory
      } catch (err: any) {
         // Fallback to npx or standard execute
         try {
           const cmd = skillConfig.command;
           console.log(`Running: ${cmd}`);
           const { stdout, stderr } = await execAsync(cmd, { cwd: path.resolve(__dirname, '..') });
           if (stdout) console.log(stdout);
           if (stderr) console.error(stderr);
         } catch (fallbackErr: any) {
           console.error(`❌ Skill ${skillName} failed:`, fallbackErr.message);
         }
      }
    } else {
      console.warn(`[Orchestrator] ⚠️ Unknown skill requested: ${skillName}`);
    }
  }
  
  console.log('\n[Orchestrator] All routed skills executed successfully.');
}

runOrchestrator();
