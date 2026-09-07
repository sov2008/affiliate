import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('FlirtCheck Editorial'),
    tags: z.array(z.string()),
    seoKeywords: z.array(z.string()),
    canonicalUrl: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
