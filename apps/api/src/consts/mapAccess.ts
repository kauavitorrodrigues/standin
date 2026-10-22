// What a route needs from the user on a map.
export const MAP_ACCESS_MODES = {
    // Members and admitted guests: the space and the render of its map.
    VIEW: "view",
    READ: "read",
    EDIT: "edit",
} as const;

export type MapAccessMode =
    (typeof MAP_ACCESS_MODES)[keyof typeof MAP_ACCESS_MODES];
