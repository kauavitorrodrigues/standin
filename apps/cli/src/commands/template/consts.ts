import { MAX_MAP_TEMPLATE_NAME_LENGTH } from "@standin/contracts";

export const TEMPLATE_COMMAND: string = "template";
export const TEMPLATE_DESCRIPTION: string =
    "Create, read and publish the map templates of the instance through the API.";

export const TEMPLATE_PATHS = {
    list: "/templates",
    one: (id: string): string => `/templates/${encodeURIComponent(id)}`,
    thumbnail: (id: string): string =>
        `/templates/${encodeURIComponent(id)}/thumbnail`,
    publish: (id: string): string =>
        `/templates/${encodeURIComponent(id)}/publish`,
} as const;

// The fields of a template the CLI reads as text.
export const TEMPLATE_STRING_FIELDS: string[] = [
    "id",
    "name",
    "status",
    "mapId",
];
export const TEMPLATE_NAME_MIN_LENGTH: number = 2;
export const TEMPLATE_NAME_PROBLEM: string = `the template name must have ${TEMPLATE_NAME_MIN_LENGTH} to ${MAX_MAP_TEMPLATE_NAME_LENGTH} characters`;

// The name of the part that carries the thumbnail.
export const THUMBNAIL_PART: string = "thumbnail";
export const THUMBNAIL_FILE_NAME: string = "thumbnail.png";

export const TEMPLATE_STATUS_DRAFT: string = "DRAFT";
export const TEMPLATE_STATUS_PUBLISHED: string = "PUBLISHED";
export const TEMPLATE_STATUS_RETIRED: string = "RETIRED";

export const TEMPLATE_MESSAGES = {
    created: (name: string, id: string, status: string): string =>
        `✓ created the template "${name}" (${id}) as ${status}`,
    specApplied: (opCount: number, mapId: string): string =>
        `✓ applied ${opCount} ops to its map ${mapId}`,
    thumbnailUploaded: "✓ uploaded the thumbnail",
    published: (name: string, id: string): string =>
        `✓ published the template "${name}" (${id})`,
    stillDraft: (id: string): string =>
        `  it is a draft: publish it with \`pnpm -s standin template publish ${id}\``,
    row: (id: string, status: string, tier: string, name: string): string =>
        `  ${id}  ${status}  ${tier}  ${name}`,
    count: (count: number): string => `templates (${count})`,
    field: (name: string, value: string): string => `  ${name}: ${value}`,
    wouldPublish: (name: string, id: string): string =>
        `✓ the template "${name}" (${id}) is a draft and can be published`,
    notDraft: (name: string, id: string, status: string): string =>
        `! the template "${name}" (${id}) is ${status}, not a draft: it cannot be published`,
    dryRunNothing: "  dry run: nothing was written",
} as const;
