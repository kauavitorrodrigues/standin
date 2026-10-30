import { buildJsonSchemas, serializeJsonSchema } from "@standin/authoring";
import type {
    CommandContext,
    CommandOutput,
    SchemaPrintArgs,
    SchemaPrintResult,
} from "../../types";
import { SCHEMA_FILE_SUFFIX } from "./consts";
import { resolveSchemaKind } from "./resolveSchemaKind";

export const runSchemaPrint = async ({
    args,
}: CommandContext<SchemaPrintArgs>): Promise<CommandOutput> => {
    const kind: string = resolveSchemaKind(args.kind);
    const schema: object = buildJsonSchemas()[`${kind}${SCHEMA_FILE_SUFFIX}`];

    const result: SchemaPrintResult = { kind, schema };
    // The text ends with a line break and the writer adds one.
    return { result, lines: [serializeJsonSchema(schema).trimEnd()] };
};
