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
    title: 'Алгоритмы Дейтинга',
    shortTitle: 'Алгоритмы',
    badgeStyle: 'bg-sky-100 text-sky-900 border-slate-900',
    badgeColor: '#0284C7',
    description: 'Деконструкция алгоритмов ELO, теневых банов, AI-диффузии и оптимизации поисковой выдачи анкет.',
    motto: 'Love is... beating the black-box algorithm by staying genuinely human.'
  },
  'modern-psychology': {
    id: 'modern-psychology',
    title: 'Современная Психология',
    shortTitle: 'Психология',
    badgeStyle: 'bg-amber-100 text-amber-900 border-slate-900',
    badgeColor: '#D97706',
    description: 'Анатомия привязанности, защита от нарциссических ловушек, гостинга и синдрома бесконечного выбора.',
    motto: "Love is... understanding your emotional anchors before drowning in someone else's storm."
  },
  'digital-dialogue': {
    id: 'digital-dialogue',
    title: 'Искусство Переписки',
    shortTitle: 'Переписка',
    badgeStyle: 'bg-emerald-100 text-emerald-900 border-slate-900',
    badgeColor: '#059669',
    description: 'Психология текстовых сообщений, живая интонация, распознавание машинных шаблонов и искусство легкой беседы.',
    motto: 'Love is... cherishing the thoughtful silence between honest messages.'
  },
  'first-dates': {
    id: 'first-dates',
    title: 'Первые Свидания',
    shortTitle: 'Свидания',
    badgeStyle: 'bg-indigo-100 text-indigo-900 border-slate-900',
    badgeColor: '#4F46E5',
    description: 'Переход из онлайна в реальный мир: сценарии встреч, комфортная дистанция и калибровка взаимности.',
    motto: 'Love is... showing up with zero filters and discovering a shared spark.'
  },
  'safety-dossier': {
    id: 'safety-dossier',
    title: 'Досье Безопасности',
    shortTitle: 'Безопасность',
    badgeStyle: 'bg-rose-100 text-rose-900 border-slate-900',
    badgeColor: '#E11D48',
    description: 'Полевой аудит скам-воронок, проверка фото по базам утечек, биометрия дипфейков и защита приватности.',
    motto: 'Love is... protecting your heart from scripted illusions, so it stays open for the real spark.'
  },
  'romantic-essays': {
    id: 'romantic-essays',
    title: 'Романтические Эссе',
    shortTitle: 'Эссе',
    badgeStyle: 'bg-orange-100 text-orange-950 border-slate-900',
    badgeColor: '#EA580C',
    description: 'Наблюдения романиста о подлинной близости, уязвимости и красоте неидеального человека.',
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
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
