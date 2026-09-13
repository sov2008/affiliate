/**
 * @file character-bible.ts
 * @description Мастер-спецификация и канонические визуальные константы персонажей (Аска и Синдзи)
 * для пайплайна генерации обложек статей, карточек и комиксов в стиле ретро-вкладышей Love is.
 */

export const ASUKA_CANON =
  'Girl (Asuka archetype): long vibrant ginger-orange twin pigtails with solid red geometric A10 barrettes, sapphire-blue eyes, teasing smirk, crimson red V-neck sweater, white collar, navy pleated skirt, white socks, red Mary Jane shoes';

export const SHINJI_CANON =
  'Boy (Shinji archetype): neat dark brown hair with messy fringe, expressive blue-grey eyes, shy blush, Tokyo-3 uniform (white short-sleeve collared shirt, navy blue necktie, dark navy trousers with belt, loafers)';

export const STYLE_LOCK =
  '1970s retro newspaper comic illustration, Love is bubblegum wrapper style, 1:3.5 head-to-body proportion, thick black ink lineart, flat pastel watercolor wash, solid pure white background, small warm yellow ground shadow';

export const NEGATIVE_LOCK =
  'fused fingers, malformed limbs, extra fingers, three fingers, fork fingers, ribbons, hair bows, polka dots, dwarf, stump legs, midget, 3d render, photorealistic, blurry, background clutter';

export interface ScenePlot {
  /** Описание сюжетного взаимодействия персонажей на английском */
  actionPrompt: string;
  /** Кастомные негативные промпты (опционально) */
  additionalNegative?: string;
}

/**
 * Сборщик финального промпта для генерации сцены с сохранением консистентности персонажей
 */
export function buildScenePrompt(scene: ScenePlot): { prompt: string; negative_prompt: string } {
  const prompt = [
    STYLE_LOCK,
    ASUKA_CANON,
    SHINJI_CANON,
    scene.actionPrompt,
    'anatomically correct hands with five distinct fingers, high negative space, isolated on pure white background'
  ].join('. ');

  const negative_prompt = scene.additionalNegative
    ? `${NEGATIVE_LOCK}, ${scene.additionalNegative}`
    : NEGATIVE_LOCK;

  return { prompt, negative_prompt };
}

import fs from 'fs';
import path from 'path';

export const CHARACTER_PATHS = {
  MASTER_CLEAN: 'assets/characters/master-asuka-shinji.png',
  PUBLIC_MASTER: 'public/images/characters/master-asuka-shinji.png',
  BLOG_MASTER: 'blog/public/images/characters/master-asuka-shinji.png',
  GOLD_MASTER: 'scratch/asuka-shinji-gold-master.png'
} as const;

/**
 * Надежный резолвинг абсолютного пути к эталону персонажей с поддержкой
 * выполнения из корня монорепо, директории core/ или blog/.
 */
export function resolveCharacterPath(key: keyof typeof CHARACTER_PATHS): string {
  const relativePath = CHARACTER_PATHS[key];
  const candidates = [
    path.resolve(process.cwd(), relativePath),
    path.resolve(process.cwd(), '..', relativePath),
    path.resolve(process.cwd(), '../../', relativePath)
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}
