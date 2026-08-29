import fs from 'fs/promises';
import path from 'path';
import { generateTaskPrompt } from './prompt-engine';
import { Offer } from './types';

async function runPipeline() {
  const mockOffer: Offer = {
    id: 'off_smart_123',
    name: 'E-commerce Smart Gadget',
    vertical: 'e-commerce',
    payout: 35.0,
    targetGeo: ['US'],
    affiliateUrlTemplate: 'https://example-tracker.com/click?offer=smart123'
  };

  const campaignsDir = path.join(process.cwd(), '..', 'campaigns');
  const outputPath = path.join(campaignsDir, 'latest-prompt.md');

  console.log(`Generating task prompt for offer: ${mockOffer.name}...`);
  
  try {
    // Ensure campaigns directory exists
    await fs.mkdir(campaignsDir, { recursive: true });

    // Generate prompt
    const generatedPrompt = await generateTaskPrompt(mockOffer);
    
    // Save to file
    await fs.writeFile(outputPath, generatedPrompt);
    
    console.log('✅ Pipeline execution successful!');
    console.log(`Prompt saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Pipeline execution failed:', error);
    process.exit(1);
  }
}

runPipeline();
