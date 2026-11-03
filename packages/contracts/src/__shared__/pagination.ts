import { z } from "zod/v4";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MAX_SEARCH_LENGTH = 100;

// What a paged list takes in the query string. `search` is a plain text the
// server matches, never a pattern.
export const PageQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    take: z.coerce
        .number()
        .int()
        .min(1)
        .max(MAX_PAGE_SIZE)
        .default(DEFAULT_PAGE_SIZE),
    search: z
        .string()
        .trim()
        .max(MAX_SEARCH_LENGTH)
        .optional()
        .transform((value) => value || undefined),
});

export type PageQuery = z.infer<typeof PageQuerySchema>;

// What a client sends: every field is optional.
export type PageQueryRequest = z.input<typeof PageQuerySchema>;

// One page of a list and how many items the list has in all.
export type Page<T> = {
    items: T[];
    total: number;
};
