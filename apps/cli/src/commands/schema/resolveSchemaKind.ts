import { SchemaKindUnknownError } from "../../errors/SchemaKindUnknownError";
import { listSchemaKinds } from "./listSchemaKinds";
import { trimSchemaSuffix } from "./trimSchemaSuffix";

// The kind as the schemas name it. The file name is accepted too.
export const resolveSchemaKind = (input: string): string => {
    const kinds: string[] = listSchemaKinds();
    const kind: string = trimSchemaSuffix(input.trim());
    if (kinds.includes(kind)) return kind;
    throw new SchemaKindUnknownError(input, kinds);
};
