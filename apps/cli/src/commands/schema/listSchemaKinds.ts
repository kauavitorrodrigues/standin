import { buildJsonSchemas } from "@standin/authoring";
import { trimSchemaSuffix } from "./trimSchemaSuffix";

// The kinds there are, in the order of the schemas: the file name without
// its suffix.
export const listSchemaKinds = (): string[] =>
    Object.keys(buildJsonSchemas()).map(trimSchemaSuffix);
