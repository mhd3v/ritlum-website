import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    youtubeId: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    ogImage: z.string().url().optional(),
    cta: z.object({ title: z.string(), label: z.string(), href: z.string().url(), note: z.string().optional() }).optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
});

export const collections = { blog };
