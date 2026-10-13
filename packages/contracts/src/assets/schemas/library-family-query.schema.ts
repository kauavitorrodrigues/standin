import { z } from "zod/v4";
import {
    DEFAULT_LIBRARY_FAMILY_PAGE_SIZE,
    LIBRARY_FAMILY_SORTS,
    MAX_LIBRARY_FAMILY_PAGE_SIZE,
    MAX_LIBRARY_SEARCH_LENGTH,
} from "../consts/library";
import { ASSET_CATEGORIES } from "../enums/asset-category";
import { ASSET_PLACEMENTS } from "../enums/asset-placement";
import { ASSET_TYPES } from "../enums/asset-type";
import { LibraryFamilyQueryErrorMessages as Messages } from "./consts/error-messages";

// Query string of `GET /library/assets`. Every filter is optional and the
// server does the search, the filtering, the sorting and the paging.
export const LibraryFamilyQuerySchema = z.object({
    search: z
        .string({ error: Messages.search.invalid })
        .trim()
        .max(MAX_LIBRARY_SEARCH_LENGTH, { error: Messages.search.invalid })
        .optional(),
    type: z.enum(ASSET_TYPES, { error: Messages.type.invalid }).optional(),
    category: z
        .enum(ASSET_CATEGORIES, { error: Messages.category.invalid })
        .optional(),
    placement: z
        .enum(ASSET_PLACEMENTS, { error: Messages.placement.invalid })
        .optional(),
    inUse: z
        .enum(["true", "false"], { error: Messages.inUse.invalid })
        .transform((value) => value === "true")
        .optional(),
    sort: z
        .enum(LIBRARY_FAMILY_SORTS, { error: Messages.sort.invalid })
        .default(LIBRARY_FAMILY_SORTS.NAME),
    page: z.coerce
        .number({ error: Messages.page.invalid })
        .int({ error: Messages.page.invalid })
        .min(1, { error: Messages.page.invalid })
        .default(1),
    pageSize: z.coerce
        .number({ error: Messages.pageSize.invalid })
        .int({ error: Messages.pageSize.invalid })
        .min(1, { error: Messages.pageSize.invalid })
        .max(MAX_LIBRARY_FAMILY_PAGE_SIZE, { error: Messages.pageSize.invalid })
        .default(DEFAULT_LIBRARY_FAMILY_PAGE_SIZE),
});

export type LibraryFamilyQuerySchemaType = z.infer<
    typeof LibraryFamilyQuerySchema
>;
