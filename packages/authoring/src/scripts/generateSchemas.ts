import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
    buildJsonSchemas,
    serializeJsonSchema,
} from "../jsonSchemas/buildJsonSchemas";
import { SCHEMAS_DIR } from "./schemasDir";

mkdirSync(SCHEMAS_DIR, { recursive: true });

for (const [file, schema] of Object.entries(buildJsonSchemas())) {
    writeFileSync(path.join(SCHEMAS_DIR, file), serializeJsonSchema(schema));
}
