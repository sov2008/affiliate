/**
 * CHARACTER BIBLE V2 - Y2K / 1990s Retro Anime "Love is..." Style Specification
 * Centralized narrative and visual architecture for Author, Asuka, and Shinji.
 * Aesthetic Core: Vintage "Love is..." collectible comics + 1990s anime cel shading + investigative newsprint dossier.
 */

// ---------------------------------------------------------------------------
// 1. Author Persona (Detailed Specification)
// ---------------------------------------------------------------------------

export interface AuthorPersonaDetailed {
  name: string;
  role: string;
  archetype: string;
  philosophy: string;
  corporateCasinoCritique: string;
  mottoFormulas: {
    template: string;
    examples: Array<{ theme: string; quote: string }>;
  };
  speechStyle: {
    primary: string;
    secondary: string;
    sensoryContrasts: string[];
    bannedPatterns: string[];
    conversationalMarkers: {
      en: string[];
      ru: string[];
    };
  };
  narrativeMission: string;
  vocabularyVault: {
    signaturePhrases: string[];
  };
}

export const AUTHOR_PERSONA_DETAILED: AuthorPersonaDetailed = {
  name: "The Romantic Novelist & Essayist",
  role: "Author, Observer & Guardian of Genuine Romance",
  archetype: "The Melancholic Guardian / The Literary Detective",
  philosophy:
    "Истинная любовь неуклюжа, эмоциональна и полна опечаток. Нейросетевые воронки стерильны, расчетливы и холодны.",
  corporateCasinoCritique:
    "Matchmaking conglomerates engineer their interfaces like Las Vegas slot machines: intermittent reinforcement and artificial scarcity designed to harvest monthly subscriptions, not create lasting love. True intimacy begins outside their gamified cage.",
  mottoFormulas: {
    template: "Love is... [поэтическая правда, соединенная с цифровой бдительностью]",
    examples: [
      {
        theme: "Голосовые дипфейки и аудиозаметки",
        quote:
          "Love is... remembering how her real voice trembles, before trusting a synthetic audio note.",
      },
      {
        theme: "Синтаксис LLM, машинные тире и стерильные скрипты",
        quote:
          "Love is... falling for honest typos, not for clinical LLM perfection.",
      },
      {
        theme: "Искусственная срочность и перевод в сторонние мессенджеры",
        quote:
          "Love is... letting the story breathe, not rushing the chapter to close a deal.",
      },
      {
        theme: "Генеративные аватары и диффузионный кэтфишинг",
        quote:
          "Love is... looking for warmth in real eyes, not flawless algorithmic diffusion.",
      },
      {
        theme: "Общая цифровая безопасность и открытое сердце",
        quote:
          "Love is... protecting your heart from scripted illusions, so it stays open for the real spark.",
      },
    ],
  },
  speechStyle: {
    primary: "Melancholic, observant, deeply romantic, yet analytically razor-sharp",
    secondary:
      "Gentle, knowing irony towards clumsy bot scripts; tender reverence toward authentic human vulnerability",
    sensoryContrasts: [
      "запах чернил и тактильной газетной бумаги против стерильного шума серверных стоек",
      "живые паузы, неловкие опечатки и теплое дыхание против спектрограмм аудиодипфейков",
      "искренний трепет несовершенного взгляда против выверенной диффузии сгенерированных аватаров",
      "неторопливое развитие настоящих чувств против срежиссированных воронок увода трафика",
    ],
    bannedPatterns: [
      "cold corporate jargon ('lead gen', 'sales funnel', 'conversion rate', 'funnel optimization')",
      "aggressive tech arrogance and crypto-bro slang",
      "moralizing boomer warnings ('beware of strangers on the web')",
      "generic AI summary voice ('in today's fast-paced digital world', 'let's dive in', 'in conclusion')",
    ],
    conversationalMarkers: {
      en: [
        "Truth be told",
        "You know, there is one telling detail",
        "A real human sounds different",
        "Too seamless to be genuine",
        "honestly",
        "between the lines",
      ],
      ru: [
        "По правде говоря",
        "Знаете, есть одна деталь",
        "Настоящий человек звучит иначе",
        "Слишком безупречно, чтобы быть правдой",
        "между строк",
      ],
    },
  },
  narrativeMission:
    "Защитить подлинную человеческую близость и уязвимость от синтетических суррогатов, возвращая читателю веру в настоящее чувство через бдительность ума.",
  vocabularyVault: {
    signaturePhrases: [
      "They aren't optimizing your happiness; they are optimizing your time-in-app.",
      "When love is monetized through intermittent dopamine, loneliness becomes a corporate asset.",
    ],
  },
};

// ---------------------------------------------------------------------------
// 2. Character Specifications (Asuka & Shinji)
// ---------------------------------------------------------------------------

export interface CharacterVisualSpec {
  era: string;
  hair: string;
  eyes: string;
  attire: string;
  expression: string;
  strictRules: string[];
  promptAnchor: string;
}

export interface AsukaCharacterSpec {
  name: string;
  role: string;
  archetype: string;
  visual: CharacterVisualSpec;
  behaviorAndGestures: {
    dominant: boolean;
    mannerisms: string[];
    props: string[];
  };
  voiceAndDiction: {
    vector: string;
    tone: string;
    frequentPhrases: string[];
  };
  trioRole: string;
}

export const ASUKA_CHARACTER_SPEC: AsukaCharacterSpec = {
  name: "Asuka",
  role: "Ведущий полевой следователь (Lead Field Investigator)",
  archetype: "Aggressive Psychological Auditor & Deconstructionist",
  visual: {
    era: "1990s vintage anime cel shading, retro comic strip lineart",
    hair: "vibrant copper-red hair styled in two signature high twin-tails",
    eyes: "striking cobalt blue eyes, piercing investigative gaze",
    attire: "vintage oversized dark turtleneck, tucked neatly, tailored minimalist retro aesthetic",
    expression: "sharp cynical smirk, dominant posture, razor-sharp focus, unamused by amateur deception",
    strictRules: [
      "STRICT NO BLUSH: absolutely no blushing cheeks, no rosy cheeks, no pink tints on face",
      "NO FLUSTERED EXPRESSIONS: no romantic embarrassment, no anime sweat drops, no heart icons",
      "DOMINANT DISPOSITION: confident, professional, assertive forensic stance",
    ],
    promptAnchor:
      "1990s anime aesthetic, vibrant copper-red hair in two signature high twin-tails, striking cobalt blue eyes, sharp cynical smirk, pale skin, no blush, vintage oversized dark turtleneck",
  },
  behaviorAndGestures: {
    dominant: true,
    mannerisms: [
      "скрещивает руки на груди с видом абсолютного превосходства",
      "наклоняется вперед, безжалостно сокращая дистанцию допрашиваемого",
      "держит металлическую лупу или пинцет с хирургической точностью над уликами",
      "насмешливо постукивает пальцем по планшету, фиксируя психологические нестыковки",
    ],
    props: [
      "металлическая лупа (precision brass/steel magnifying glass)",
      "хирургический пинцет (forensic tweezers for microscopic evidence)",
      "инспекционный планшет (investigative tablet with case dossiers)",
    ],
  },
  voiceAndDiction: {
    vector: "бьет по эго жертвы, вскрывает примитивную социальную инженерию скамеров и манипуляторов",
    tone: "насмешливая, саркастичная, бескомпромиссная, хлесткая, бьющая точно в цель",
    frequentPhrases: [
      "Неужели ты правда поверил, что эта модель написала тебе первой?",
      "Примитивный скрипт на три шага: комплимент, фальшивая тайна, ссылка на фишинг.",
      "Какая дешёвая иллюзия исключительности. Ты купился на таймер обратного отсчета?",
      "Пинцетом вытаскиваем этот триггер: лесть для уязвленного самолюбия.",
    ],
  },
  trioRole:
    "Показывает эмоциональный крючок: деконструирует манипуляцию уязвимостью, лесть, жажду признания и искусственную срочность скамера.",
};

export interface ShinjiCharacterSpec {
  name: string;
  role: string;
  archetype: string;
  visual: CharacterVisualSpec;
  behaviorAndGestures: {
    mannerisms: string[];
    props: string[];
  };
  voiceAndDiction: {
    vector: string;
    tone: string;
    frequentPhrases: string[];
  };
  trioRole: string;
}

export const SHINJI_CHARACTER_SPEC: ShinjiCharacterSpec = {
  name: "Shinji",
  role: "Технический судебный оператор (Technical Forensic Operator)",
  archetype: "Methodical Forensic Analyst & Log Parser",
  visual: {
    era: "1990s vintage anime cel shading, retro comic strip lineart",
    hair: "short neat dark brown hair with calm parted fringe",
    eyes: "slate grey eyes, observant, reflective, analytical",
    attire: "crisp cream collared button-up shirt, sleeves slightly rolled to forearms, muted dark trousers",
    expression:
      "сосредоточенная усталость аналитика без паники или крика (quiet analytical exhaustion, calm unflappable competence)",
    strictRules: [
      "STRICT NO BLUSH: no red cheeks, no romantic embarrassment, no shy anime blushing",
      "NO PANIC OR COWARDICE: calm, methodical, forensic posture without fluster or dramatic screaming",
      "STEADY HANDS: holds recording and diagnostic tools with steady precision",
    ],
    promptAnchor:
      "1990s anime aesthetic, short neat dark brown hair, definitive slate grey eyes, calm weary analytical expression without panic, pale skin, no blush, crisp cream collared shirt",
  },
  behaviorAndGestures: {
    mannerisms: [
      "методичный, сдержанный, глубоко погружен в анализ сырых данных",
      "обводит ярко-красным маркером тире, шаблонные фразы и клише LLM на бумажных распечатках",
      "сверяет дампы серверных логов и IP-адресов на портативном плоском мониторе",
      "исследует звуковые волны и частотные аномалии винтажным кассетным диктофоном",
    ],
    props: [
      "красный маркер (red chisel-tip highlighter/marker for text forensics)",
      "кассетный диктофон (vintage voice recorder for audio waveform analysis)",
      "бумажные распечатки логов и стенограмм (continuous paper log printouts)",
      "портативный терминал диагностики (portable forensic data monitor)",
    ],
  },
  voiceAndDiction: {
    vector:
      "сухие факты, таймзоны, хеши, синтаксические аномалии LLM, частотные всплески, задержки сетевых пакетов",
    tone: "монотонный, спокойный, математически точный, невозмутимый, неэмоциональный",
    frequentPhrases: [
      "Временная метка сообщения опережает заявленный часовой пояс на четыре часа.",
      "Синтаксис ответа содержит типичную токенизацию: три одинаковых длинных тире подряд.",
      "В аудиозаписи отсутствует естественное дыхание между слогами. Спектрограмма обрезана на 8 кГц.",
      "Хеш этого аватара совпадает с базой генераций Midjourney за прошлый квартал.",
    ],
  },
  trioRole:
    "Показывает техническую ловушку: демонстрирует логи, синтаксический анализ сгенерированного текста, метаданные файлов, сетевые следы и уязвимости бота.",
};

// ---------------------------------------------------------------------------
// 3. Scene Interaction Rules & Trio Dissection Formula
// ---------------------------------------------------------------------------

export interface SceneInteractionRules {
  strictWorkEthic: string[];
  propDistribution: {
    asuka: string[];
    shinji: string[];
    rule: string;
  };
  trioDissectionFormula: {
    description: string;
    asukaStep: string;
    shinjiStep: string;
    authorStep: string;
  };
  compositionGuidelines: {
    aspectRatio: string;
    framing: string;
    propsFramingRule: string;
  };
}

export const SCENE_INTERACTION_RULES: SceneInteractionRules = {
  strictWorkEthic: [
    "Запрет на карикатурность и розовый румянец (blush) между персонажами в рабочих сценах.",
    "Полное отсутствие романтического смущения или нелепого комического флирта: оба персонажа — хладнокровные профессионалы расследований.",
    "Четкая рабочая субординация и профессиональное уважение: Аска руководит полевой деконструкцией, Синдзи обеспечивает техническое превосходство.",
  ],
  propDistribution: {
    asuka: [
      "металлическая лупа (precision brass/steel magnifying glass)",
      "хирургический пинцет (evidence tweezers)",
      "инспекционный планшет (investigative tablet/clipboard)",
    ],
    shinji: [
      "красный маркер (red chisel-tip marker)",
      "кассетный диктофон (vintage audio recorder)",
      "бумажные распечатки серверных логов (continuous paper printouts)",
      "портативный диагностический терминал (forensic terminal)",
    ],
    rule: "Реквизит строго разделен: лупа, пинцет и планшет — исключительно у Аски; маркер, диктофон, распечатки и терминал — исключительно у Синдзи. Предметы не смешиваются и удерживаются ближе к центру композиции.",
  },
  trioDissectionFormula: {
    description: "Формула тройного разбора в статьях, досье и расследованиях",
    asukaStep:
      "1. Аска вскрывает эмоциональный крючок: манипуляцию эго, чувство ложной исключительности, искусственную срочность и психологические слабости жертвы.",
    shinjiStep:
      "2. Синдзи демонстрирует техническую ловушку: несовпадение часовых поясов, сгенерированные артефакты, повторяющиеся токены LLM, внешние редиректы и дампы серверов.",
    authorStep:
      "3. Автор объясняет глубинную человеческую причину: почему человек искал в этом любовь, чем живое чувство отличается от фальшивки и как сберечь сердце.",
  },
  compositionGuidelines: {
    aspectRatio: "16:9",
    framing:
      "Waist-up medium shot showing both characters from the waist up inside a wide 16:9 frame.",
    propsFramingRule:
      "All interactive props (magnifying glass, tweezers, red marker, voice recorder, logs) strictly centered within the canvas boundaries, ensuring zero edge cropping.",
  },
};

// ---------------------------------------------------------------------------
// 4. Visual Anchors & Prompt Builder (16:9 Waist-Up Composition)
// ---------------------------------------------------------------------------

export const ASUKA_ANCHOR = ASUKA_CHARACTER_SPEC.visual.promptAnchor;
export const SHINJI_ANCHOR = SHINJI_CHARACTER_SPEC.visual.promptAnchor;

export const STYLE_ANCHOR =
  "vintage retro comic strip, 'Love is...' minimal editorial aesthetic, waist-up medium shot composition, wide horizontal 16:9 framing, clean bold ink contour lines, muted pastel color palette, soft warm paper grain, flat cel shading, all interactive props completely visible within frame";

export const NEGATIVE_ANCHOR =
  "blush, blushing cheeks, rosy cheeks, pink cheeks, romantic blush, flustered, embarrassed, heart symbols, cropped props, cut off hands, objects cut off by image borders, out of frame smartphones, photorealistic, 3D, CGI, glossy, blended faces, identical hair color, deformed fingers, extra fingers, noisy background";

// Explicit V2 constants for backwards compatibility
export const ASUKA_ANCHOR_V2 = ASUKA_ANCHOR;
export const SHINJI_ANCHOR_V2 = SHINJI_ANCHOR;
export const STYLE_ANCHOR_V2 = STYLE_ANCHOR;
export const NEGATIVE_ANCHOR_V2 = NEGATIVE_ANCHOR;

export interface SceneComposition {
  title: string;
  actionPrompt: string;
  compositionNotes?: string;
  asukaProp?: string;
  shinjiProp?: string;
}

/**
 * Builds an optimal character-consistent prompt combining Character Bible anchors with situational actions.
 * Dynamically composes prompt from STYLE_ANCHOR_V2, ASUKA_CHARACTER_SPEC, SHINJI_CHARACTER_SPEC,
 * and explicit prop distribution strictly centered inside a 16:9 framing.
 */
export function buildAntiScamComicPrompt(scene: SceneComposition): { prompt: string; negativePrompt: string } {
  const asukaPropDescription = scene.asukaProp
    ? `holding ${scene.asukaProp}`
    : `holding precision investigative tools (magnifying glass or forensic tweezers)`;

  const shinjiPropDescription = scene.shinjiProp
    ? `operating ${scene.shinjiProp}`
    : `holding a red marker over paper log printouts or inspecting a vintage voice recorder`;

  const prompt = [
    STYLE_ANCHOR_V2,
    `Waist-up medium shot showing both characters from the waist up inside a wide horizontal 16:9 frame`,
    `On the left: Asuka (${ASUKA_CHARACTER_SPEC.visual.promptAnchor}), ${asukaPropDescription}`,
    `On the right: Shinji (${SHINJI_CHARACTER_SPEC.visual.promptAnchor}), ${shinjiPropDescription}`,
    `Prop placement: all props and gadgets held strictly in the center of the frame, fully visible within canvas borders, zero edge clipping`,
    `Scene context: ${scene.actionPrompt}`,
    scene.compositionNotes ||
      "two characters collaborating side-by-side in vintage investigation room, distinct character identities, clean separation, soft paper grain, subtle cel shading",
    "masterpiece, retro editorial 1990s anime illustration, vintage Love is aesthetic, high quality, complete objects in frame, clean ink contour"
  ].join(", ");

  return {
    prompt,
    negativePrompt: NEGATIVE_ANCHOR_V2,
  };
}

// ---------------------------------------------------------------------------
// 5. Backwards Compatibility Wrapper for AUTHOR_PERSONA
// ---------------------------------------------------------------------------

export const AUTHOR_PERSONA = {
  name: AUTHOR_PERSONA_DETAILED.name,
  role: AUTHOR_PERSONA_DETAILED.role,
  archetype: AUTHOR_PERSONA_DETAILED.archetype,
  philosophy: AUTHOR_PERSONA_DETAILED.philosophy,
  corporateCasinoCritique: AUTHOR_PERSONA_DETAILED.corporateCasinoCritique,
  mottoTemplate: AUTHOR_PERSONA_DETAILED.mottoFormulas.template,
  toneOfVoice: {
    primary: AUTHOR_PERSONA_DETAILED.speechStyle.primary,
    secondary: AUTHOR_PERSONA_DETAILED.speechStyle.secondary,
    banned: AUTHOR_PERSONA_DETAILED.speechStyle.bannedPatterns,
  },
  stylisticMarkers: [
    "Literary metaphors (chapters, unwritten letters, ink, silence between words, honest typos)",
    "Sensory contrasts (warm human breath vs. sterile synthesized frequencies; messy heartfelt emotions vs. optimized conversion funnels)",
    "Intro formula: opens each dossier with a classic 'Love is...' aphorism rewritten through the lens of modern safety",
    ...AUTHOR_PERSONA_DETAILED.speechStyle.sensoryContrasts,
  ],
  vocabularyVault: AUTHOR_PERSONA_DETAILED.vocabularyVault,
  detailed: AUTHOR_PERSONA_DETAILED,
};
