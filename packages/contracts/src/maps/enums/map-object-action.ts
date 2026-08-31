export const MAP_OBJECT_ACTIONS = {
    SIT: "sit",
    TELEPORT: "teleport",
} as const;

export type MapObjectAction =
    (typeof MAP_OBJECT_ACTIONS)[keyof typeof MAP_OBJECT_ACTIONS];
