import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { stitch } from '@google/stitch-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const projectId = '1424553323989134013';
  const project = stitch.project(projectId);
  const screens = await project.screens();

  console.log('Project instance keys:', Object.keys(project));
  console.log('First screen raw data:', JSON.stringify(screens[0].data, null, 2));

  // Check client tools
  if (project.client && project.client.client) {
    try {
      const tools = await project.client.client.listTools();
      console.log('Available MCP tools in Stitch SDK:', tools.tools.map(t => t.name));
    } catch (e) {
      console.log('Tools list error:', e.message);
    }
  }
}

main().catch(console.error);

