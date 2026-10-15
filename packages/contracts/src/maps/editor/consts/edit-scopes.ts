// Which part of a map an editing session may change. `map` is the whole map
// (the Studio), `objects` is only the placed objects (the decorator).
export const EDIT_SCOPES = {
    MAP: "map",
    OBJECTS: "objects",
} as const;
