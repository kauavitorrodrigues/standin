import { buildJsonSchemas, serializeJsonSchema } from "@standin/authoring";
import { describe, expect, it } from "vitest";
import { EXIT_CODES } from "../../../consts/exitCodes";
import { runCliFake } from "../../../testing/runCliFake";

const KINDS = [
    "spec",
    "library",
    "library-tileset",
    "library-asset",
    "library-variant",
    "library-area",
];

describe("schema print", () => {
    it.each(KINDS)(
        "prints the schema of %s without any network",
        async (kind) => {
            const run = await runCliFake(["schema", "print", kind]);

            expect(run.code).toBe(EXIT_CODES.OK);
            expect(run.out).toBe(
                serializeJsonSchema(buildJsonSchemas()[`${kind}.schema.json`])
            );
            expect(run.fake.requests).toHaveLength(0);
        }
    );

    it("accepts the file name", async () => {
        const run = await runCliFake(["schema", "print", "spec.schema.json"]);

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(JSON.parse(run.out)).toEqual(
            buildJsonSchemas()["spec.schema.json"]
        );
    });

    it("wraps the schema in the envelope with --json", async () => {
        const run = await runCliFake(["schema", "print", "spec", "--json"]);

        const document = JSON.parse(run.out);
        expect(document).toEqual({
            ok: true,
            command: "schema print",
            result: {
                kind: "spec",
                schema: buildJsonSchemas()["spec.schema.json"],
            },
        });
        expect(run.out.trim().split("\n")).toHaveLength(1);
    });

    it("is a usage error that lists the kinds for an unknown one", async () => {
        const run = await runCliFake(["schema", "print", "world", "--json"]);

        expect(run.code).toBe(EXIT_CODES.USAGE);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_SCHEMA_UNKNOWN");
        for (const kind of KINDS) expect(error.fix).toContain(kind);
    });

    it("needs the kind", async () => {
        const run = await runCliFake(["schema", "print", "--json"]);

        expect(run.code).toBe(EXIT_CODES.USAGE);
    });
});
