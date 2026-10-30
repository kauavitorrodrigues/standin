export const SCHEMA_COMMAND: string = "schema";
export const SCHEMA_PRINT_COMMAND: string = "print";
// The name the JSON output uses.
export const SCHEMA_PRINT_NAME: string = "schema print";
export const SCHEMA_FILE_SUFFIX: string = ".schema.json";

export const SCHEMA_DESCRIPTION: string =
    "Print the JSON Schema of a file format.";

export const SCHEMA_PRINT_DESCRIPTION: string =
    "Print the JSON Schema of a format. No instance, no login and no database are needed.";

export const SCHEMA_PRINT_HELP: string = `
Kinds: spec (map, template and area specs), library (library.json),
library-tileset, library-asset, library-variant, library-area. The file name
is accepted too, such as spec.schema.json.

The schema is the one the code validates with, so an editor or an agent can
check a file before it is sent. Without --json the output is the schema only,
ready to be redirected to a file; with --json it is inside the usual envelope.

Examples:
  pnpm -s standin schema print spec
  pnpm -s standin schema print library-asset > asset.schema.json
  pnpm -s standin schema print spec --json`;
