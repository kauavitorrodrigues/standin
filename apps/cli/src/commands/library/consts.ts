export const LIBRARY_COMMAND: string = "library";
export const LIBRARY_LIST_COMMAND: string = "list";
// The name the JSON output uses.
export const LIBRARY_LIST_NAME: string = "library list";

export const LIBRARY_PATHS = {
    OVERVIEW: "/library/overview",
    TILESETS: "/library/tilesets",
    ASSETS: "/library/assets",
    AREAS: "/library/areas",
} as const;

export const LIBRARY_DESCRIPTION: string =
    "Read the global library of the instance.";

export const LIBRARY_LIST_DESCRIPTION: string =
    "List the tilesets, the assets and the areas of the global library, by key and name. Needs a token with the library:read scope.";

export const LIBRARY_LIST_HELP: string = `
These are the keys and names a map spec refers to. An asset is listed once per
family (its base key); the variants count is how many rows the family has.
Areas have no key, they are listed by name with their id.

Examples:
  pnpm -s standin library list
  pnpm -s standin library list --json
  STANDIN_URL=http://localhost:3001 STANDIN_TOKEN='<token>' pnpm -s standin library list`;

export const LIBRARY_MESSAGES = {
    heading: (title: string, count: number): string => `${title} (${count})`,
    tileset: (key: string, name: string, tileCount: number): string =>
        `  ${key}  ${name}  ${tileCount} tiles`,
    asset: (key: string, name: string, category: string): string =>
        `  ${key}  ${name}  ${category}`,
    area: (name: string, width: number, height: number, id: string): string =>
        `  ${name}  ${width}x${height}  ${id}`,
} as const;

export const LIBRARY_HEADINGS = {
    TILESETS: "tilesets",
    ASSETS: "assets",
    AREAS: "areas",
} as const;
