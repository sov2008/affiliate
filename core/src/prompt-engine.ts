import { GoogleGenAI } from '@google/genai';
import { Offer } from './types';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Ensure environment variables are loaded from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const ai = new GoogleGenAI();

export async function generateTaskPrompt(offer: Offer): Promise<string> {
  const prompt = `
    You are an Elite Traffic & Affiliate Architect. 
    
    Generate a complete, standalone execution prompt that instructs an AI developer to build a production-ready landing page for the following offer:
    
    Offer Details:
    - ID: ${offer.id}
    - Name: ${offer.name}
    - Vertical: ${offer.vertical}
    - Target Geo: ${offer.targetGeo.join(', ')}
    - Payout: $${offer.payout}
    
    The resulting prompt MUST strictly require the following from the developer:
    1. A mobile-first responsive layout using Tailwind CSS via CDN.
    2. A clean, high-converting design standard for the ${offer.vertical} vertical.
    3. Client-side URL parameter extraction (specifically 'click_id', 'sub1', 'sub2').
    4. Dynamic injection of these extracted parameters into all outbound Call-To-Action (CTA) links targeting the affiliate base URL: ${offer.affiliateUrlTemplate}
    
    Format the output as a clear, instructional prompt ready to be fed to an AI coding assistant.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (!response.text) {
      throw new Error("No text returned from Gemini API");
    }

    return response.text;
  } catch (error) {
    console.error("Error generating task prompt:", error);
    throw error;
  }
}
