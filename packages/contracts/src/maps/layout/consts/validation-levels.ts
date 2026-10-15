// How deep `validateLayout` checks:
// - light: size, layer shape and gid range. Runs after every operation.
// - complete: everything. Runs on copy and on publication.
// - creation: complete, plus the tier must be enabled.
export const LAYOUT_VALIDATION_LEVELS = {
    LIGHT: "light",
    COMPLETE: "complete",
    CREATION: "creation",
} as const;
