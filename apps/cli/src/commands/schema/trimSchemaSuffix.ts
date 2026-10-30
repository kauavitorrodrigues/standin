import { SCHEMA_FILE_SUFFIX } from "./consts";

// spec.schema.json is the same kind as spec.
export const trimSchemaSuffix = (typed: string): string => {
    if (!typed.endsWith(SCHEMA_FILE_SUFFIX)) return typed;
    return typed.slice(0, -SCHEMA_FILE_SUFFIX.length);
};
