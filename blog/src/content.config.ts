import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const CategoryEnum = z.enum([
  'algo-mechanics',
  'modern-psychology',
  'digital-dialogue',
  'first-dates',
  'safety-dossier',
  'romantic-essays'
]);

export type Category = z.infer<typeof CategoryEnum>;

export interface CategoryMetadata {
  id: Category;
  title: string;
  shortTitle: string;
  badgeStyle: string;
  badgeColor: string;
  description: string;
  motto: string;
}

export const CATEGORIES_METADATA: Record<Category, CategoryMetadata> = {
  'algo-mechanics': {
    id: 'algo-mechanics',
    title: 'Algorithmic Mechanics',
    shortTitle: 'ALGO MECHANICS',
    badgeStyle: 'bg-sky-100 text-sky-900 border-slate-900',
    badgeColor: '#0284C7',
    description: 'Deconstructing ELO black-boxes, algorithmic shadowbans, AI diffusion feeds, and dating profile indexing.',
    motto: 'Love is... beating the black-box algorithm by staying genuinely human.'
  },
  'modern-psychology': {
    id: 'modern-psychology',
    title: 'Modern Psychology',
    shortTitle: 'MODERN PSYCHOLOGY',
    badgeStyle: 'bg-amber-100 text-amber-900 border-slate-900',
    badgeColor: '#D97706',
    description: 'Attachment styles, navigating manipulative traps, ghosting fatigue, and the paradox of infinite choice.',
    motto: "Love is... understanding your emotional anchors before drowning in someone else's storm."
  },
  'digital-dialogue': {
    id: 'digital-dialogue',
    title: 'Digital Dialogue',
    shortTitle: 'DIGITAL DIALOGUE',
    badgeStyle: 'bg-emerald-100 text-emerald-900 border-slate-900',
    badgeColor: '#059669',
    description: 'Subtext analysis, natural conversation pacing, spotting automated scripts, and reviving playful texting.',
    motto: 'Love is... cherishing the thoughtful silence between honest messages.'
  },
  'first-dates': {
    id: 'first-dates',
    title: 'Offline First Dates',
    shortTitle: 'OFFLINE DATES',
    badgeStyle: 'bg-indigo-100 text-indigo-900 border-slate-900',
    badgeColor: '#4F46E5',
    description: 'Transitioning from screen to reality: low-pressure venues, boundary calibration, and chemistry cues.',
    motto: 'Love is... showing up with zero filters and discovering a shared spark.'
  },
  'safety-dossier': {
    id: 'safety-dossier',
    title: 'Safety Dossier & Scams',
    shortTitle: 'SAFETY & SCAMS',
    badgeStyle: 'bg-rose-100 text-rose-900 border-slate-900',
    badgeColor: '#E11D48',
    description: 'Investigating pig butchering rings, romance bots, reverse-image leaks, and digital forensics.',
    motto: 'Love is... protecting your heart from scripted illusions, so it stays open for the real spark.'
  },
  'romantic-essays': {
    id: 'romantic-essays',
    title: 'Romantic Essays',
    shortTitle: 'ROMANTIC ESSAYS',
    badgeStyle: 'bg-orange-100 text-orange-950 border-slate-900',
    badgeColor: '#EA580C',
    description: 'Observations on vulnerability, analog intimacy, and the raw beauty of imperfect human connection.',
    motto: 'Love is... falling for honest typos and fragile warmth, not clinical perfection.'
  }
};

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('FlirtCheck Editorial'),
    category: CategoryEnum.default('safety-dossier'),
    tags: z.array(z.string()),
    seoKeywords: z.array(z.string()),
    canonicalUrl: z.string().optional(),
    coverImage: z.string().optional(),
    image: z.string().optional(),
    motto: z.string().optional(),
    hook: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
