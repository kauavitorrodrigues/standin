import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
    buildJsonSchemas,
    serializeJsonSchema,
} from "../jsonSchemas/buildJsonSchemas";
import { SCHEMAS_DIR } from "../scripts/schemasDir";

const schemas = Object.entries(buildJsonSchemas());

describe("the JSON Schemas", () => {
    it("has one for the spec, the library file and the create payloads", () => {
        expect(schemas.map(([file]) => file)).toEqual([
            "spec.schema.json",
            "library.schema.json",
            "library-tileset.schema.json",
            "library-asset.schema.json",
            "library-variant.schema.json",
            "library-area.schema.json",
        ]);
    });

    it.each(schemas)(
        "%s is the file in the repo (run pnpm generate:schemas when it changes)",
        (file, schema) => {
            const committed = readFileSync(
                path.join(SCHEMAS_DIR, file),
                "utf8"
            );

            expect(committed).toBe(serializeJsonSchema(schema));
        }
    );

    it("is the same on every run", () => {
        expect(buildJsonSchemas()).toEqual(buildJsonSchemas());
    });

    it("refuses what the spec does not know", () => {
        const spec = buildJsonSchemas()["spec.schema.json"] as {
            oneOf: { additionalProperties: boolean }[];
        };

        expect(spec.oneOf.map((kind) => kind.additionalProperties)).toEqual([
            false,
            false,
            false,
        ]);
    });
});
