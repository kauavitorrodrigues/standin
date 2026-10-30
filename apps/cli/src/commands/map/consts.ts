export const MAP_COMMAND: string = "map";
export const MAP_DESCRIPTION: string =
    "Validate and apply map specs through the API of an instance.";

export const MAP_PATHS = {
    render: (mapId: string): string =>
        `/maps/${encodeURIComponent(mapId)}/render`,
    library: (mapId: string): string =>
        `/maps/${encodeURIComponent(mapId)}/library`,
    apply: (mapId: string): string =>
        `/maps/${encodeURIComponent(mapId)}/apply`,
} as const;

// The kinds of spec that build the layout of a map; an area is a library
// entry and is not applied to a map.
export const AREA_KIND: string = "area";
// The kind of spec that builds a template.
export const TEMPLATE_KIND: "template" = "template";
export const BASE_VERSION_PATTERN: RegExp = /^[1-9]\d*$/;
