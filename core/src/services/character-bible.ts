/**
 * CHARACTER BIBLE V2 - Y2K / 1990s Retro Anime "Love is..." Style Specification
 * Centralized anchors for Asuka & Shinji anti-scam / cybersecurity comic covers.
 * V2 Focus: Waist-up medium shots, strict suppression of romantic blush, fully visible props in 16:9 framing.
 */

export const ASUKA_ANCHOR =
  "1990s anime aesthetic, vibrant copper-red hair in two signature high twin-tails, striking cobalt blue eyes, sharp cynical smirk, pale skin, no blush, vintage oversized dark turtleneck";

export const SHINJI_ANCHOR =
  "1990s anime aesthetic, short neat dark brown hair, definitive soft grey eyes, serious analytical bewildered expression, pale skin, no blush, no red cheeks, crisp cream collared shirt";

export const STYLE_ANCHOR =
  "vintage retro comic strip, 'Love is...' minimal editorial aesthetic, waist-up medium shot composition, wide horizontal 16:9 framing, clean bold ink contour lines, muted pastel color palette, soft warm paper grain, flat cel shading, all interactive props completely visible within frame";

export const NEGATIVE_ANCHOR =
  "blush, blushing cheeks, rosy cheeks, pink cheeks, romantic blush, flustered, embarrassed, heart symbols, cropped props, cut off hands, objects cut off by image borders, out of frame smartphones, photorealistic, 3D, CGI, glossy, blended faces, identical hair color, deformed fingers, extra fingers, noisy background";

// Explicit V2 constants as specified
export const ASUKA_ANCHOR_V2 = ASUKA_ANCHOR;
export const SHINJI_ANCHOR_V2 = SHINJI_ANCHOR;
export const STYLE_ANCHOR_V2 = STYLE_ANCHOR;
export const NEGATIVE_ANCHOR_V2 = NEGATIVE_ANCHOR;

export interface SceneComposition {
  title: string;
  actionPrompt: string;
  compositionNotes?: string;
}

/**
 * Builds an optimal character-consistent prompt combining Character Bible anchors with situational actions.
 * Ensures waist-up framing so gadgets, screens, markers, and timers never get cut off at canvas edges.
 */
export function buildAntiScamComicPrompt(scene: SceneComposition): { prompt: string; negativePrompt: string } {
  const prompt = [
    STYLE_ANCHOR_V2,
    `Waist-up medium shot showing both characters from the waist up inside a wide 16:9 frame.`,
    `On the left: Asuka (${ASUKA_ANCHOR_V2}).`,
    `On the right: Shinji (${SHINJI_ANCHOR_V2}).`,
    `Scene context: ${scene.actionPrompt}`,
    scene.compositionNotes || "two characters interacting side-by-side, clear separation, distinct character features, all props held within center of the frame",
    "masterpiece, retro editorial illustration, high quality, complete objects in frame, clean cel anime"
  ].join(", ");

  return {
    prompt,
    negativePrompt: NEGATIVE_ANCHOR_V2,
  };
}

export const AUTHOR_PERSONA = {
  name: "The Romantic Novelist & Essayist",
  role: "Author, Observer & Guardian of Genuine Romance",
  philosophy: "Love is an art of vulnerability, spontaneous warmth, and honest imperfections. Synthetic LLM scripts, fake photos, and scam funnels are cheap counterfeits that desecrate real romance.",
  mottoTemplate: "Love is... [poetic truth paired with realistic digital awareness]",
  toneOfVoice: {
    primary: "Melancholic, observant, deeply romantic, yet analytically sharp",
    secondary: "Gentle irony towards clumsy bot scripts; tenderness toward real human feelings",
    banned: [
      "cold corporate jargon",
      "aggressive tech arrogance",
      "crypto-bro slang",
      "moralizing boomer warnings",
      "generic AI summary voice"
    ]
  },
  stylisticMarkers: [
    "Literary metaphors (chapters, unwritten letters, ink, silence between words, honest typos)",
    "Sensory contrasts (warm human breath vs. sterile synthesized frequencies; messy heartfelt emotions vs. optimized conversion funnels)",
    "Intro formula: opens each dossier with a classic 'Love is...' aphorism rewritten through the lens of modern safety"
  ]
};
