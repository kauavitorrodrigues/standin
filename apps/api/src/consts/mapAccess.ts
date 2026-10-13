// What a route needs from the user on a map.
export const MAP_ACCESS_MODES = {
    READ: "read",
    EDIT: "edit",
} as const;

export type MapAccessMode =
    (typeof MAP_ACCESS_MODES)[keyof typeof MAP_ACCESS_MODES];
