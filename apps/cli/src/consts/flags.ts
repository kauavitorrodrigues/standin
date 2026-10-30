// The flags of the template and content commands, as the errors name them.
export const FLAGS = {
    PUBLISH: "--publish",
    THUMBNAIL: "--thumbnail",
    SIZE_TIER: "--size-tier",
    SPEC: "--spec",
    DESCRIPTION: "--description",
} as const;

// The fields of a spec an issue points at.
export const SPEC_FIELDS = {
    KIND: "kind",
    NAME: "name",
    SIZE_TIER: "sizeTier",
} as const;
