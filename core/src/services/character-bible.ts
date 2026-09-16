/**
 * CHARACTER BIBLE - Y2K / 1990s Retro Anime "Love is..." Style Specification
 * Centralized anchors for Asuka & Shinji anti-scam / cybersecurity comic covers.
 */

export const ASUKA_ANCHOR =
  "1990s anime aesthetic, vibrant copper-red hair in two signature high twin-tails, striking cobalt blue eyes, sharp cynical smirk, vintage oversized dark turtleneck";

export const SHINJI_ANCHOR =
  "1990s anime aesthetic, short neat dark brown hair, soft grey eyes, tired bewildered expression, crisp cream collared shirt";

export const STYLE_ANCHOR =
  "vintage retro comic strip, 'Love is...' minimal aesthetic, clean bold ink contour lines, muted pastel color palette, soft warm paper grain, flat cel shading";

export const NEGATIVE_ANCHOR =
  "photorealistic, 3D, CGI, glossy, blended faces, identical hair color, deformed fingers, noisy background";

export interface SceneComposition {
  title: string;
  actionPrompt: string;
  compositionNotes?: string;
}

/**
 * Builds an optimal character-consistent prompt combining Character Bible anchors with situational actions.
 */
export function buildAntiScamComicPrompt(scene: SceneComposition): { prompt: string; negativePrompt: string } {
  const prompt = [
    STYLE_ANCHOR,
    `On the left: Asuka (${ASUKA_ANCHOR}).`,
    `On the right: Shinji (${SHINJI_ANCHOR}).`,
    `Scene context: ${scene.actionPrompt}`,
    scene.compositionNotes || "two characters interacting, clear separation, distinct character features, retro vignette framing",
    "masterpiece, retro editorial illustration, high quality"
  ].join(", ");

  return {
    prompt,
    negativePrompt: NEGATIVE_ANCHOR,
  };
}
