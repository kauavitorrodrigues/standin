import { z } from "zod/v4";
import {
    CreateAssetDataSchema,
    CreateTilesetDataSchema,
    CreateVariantDataSchema,
} from "./library-data.schema";

const file = z.string().min(1);

// `library.json`: the `data` of each creation endpoint plus the PNG path
// (relative to the folder of the file).
const tilesetEntry = CreateTilesetDataSchema.omit({
    organizationId: true,
    key: true,
}).extend({ key: z.string().min(1), file });

const variantEntry = CreateVariantDataSchema.extend({ file });

const assetEntry = CreateAssetDataSchema.omit({
    organizationId: true,
    key: true,
}).extend({
    key: z.string().min(1),
    file,
    variants: z.array(variantEntry).optional(),
});

export const LibrarySeedFileSchema = z.object({
    tilesets: z.array(tilesetEntry).default([]),
    assets: z.array(assetEntry).default([]),
});

export type LibrarySeedFile = z.infer<typeof LibrarySeedFileSchema>;
