import { z } from "zod/v4";
import {
    AreaBodySchema,
    CreateAssetDataSchema,
    CreateTilesetDataSchema,
    CreateVariantDataSchema,
    LibrarySeedFileSchema,
} from "@standin/contracts";
import { SpecSchema } from "../spec/schemas/spec.schema";

// The files of the schemas folder, by name. Each schema is read from the zod
// schema the code itself validates with.
const SOURCES = {
    "spec.schema.json": SpecSchema,
    "library.schema.json": LibrarySeedFileSchema,
    "library-tileset.schema.json": CreateTilesetDataSchema,
    "library-asset.schema.json": CreateAssetDataSchema,
    "library-variant.schema.json": CreateVariantDataSchema,
    "library-area.schema.json": AreaBodySchema,
} as const;

/** The JSON Schema of each format, by file name. What goes in is described. */
export const buildJsonSchemas = (): Record<string, object> =>
    Object.fromEntries(
        Object.entries(SOURCES).map(([file, schema]) => [
            file,
            z.toJSONSchema(schema, { io: "input" }),
        ])
    );

/** The text of a schema file, the same bytes every time. */
export const serializeJsonSchema = (schema: object): string =>
    `${JSON.stringify(schema, null, 4)}\n`;
