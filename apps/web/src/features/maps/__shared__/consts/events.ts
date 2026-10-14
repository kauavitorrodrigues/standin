// Events the scene and the React side exchange through `game.events`. Only
// discrete changes travel here, never every pointer move.
export const EDITOR_EVENTS = {
    // Scene to React. Payload: the zoom level.
    ZOOM_CHANGED: "editor:zoom-changed",
    // Scene to React. Payload: the cell under the cursor, or null.
    CELL_HOVERED: "editor:cell-hovered",
    // Scene to React. Payload: the footer hint, or null.
    HINT_CHANGED: "editor:hint-changed",
    // Scene to React. No payload.
    SCENE_READY: "editor:scene-ready",
    // Scene to React. Payload: where the selected object is on the page (a
    // ScreenRect), or null when there is none. Written to the DOM, not to state.
    SELECTION_ANCHOR_CHANGED: "editor:selection-anchor-changed",
    // React to scene. No payload.
    FIT_REQUESTED: "editor:fit-requested",
    // React to scene. Payload: the cell to center the camera on.
    FOCUS_CELL_REQUESTED: "editor:focus-cell-requested",
    // Scene to React. Payload: a ZoneNameRequest, to ask the name of an area.
    ZONE_NAME_REQUESTED: "editor:zone-name-requested",
    // Scene to React. No payload. The scene dropped the request itself.
    ZONE_NAME_CLOSED: "editor:zone-name-closed",
    // React to scene. Payload: the name typed.
    ZONE_NAME_CONFIRMED: "editor:zone-name-confirmed",
    // React to scene. No payload.
    ZONE_NAME_CANCELLED: "editor:zone-name-cancelled",
    // Scene to React. Payload: where the selected zone is on the screen (a
    // ScreenRect), or null when there is none to show. Sent only when it
    // changes, and meant to write to the DOM, not to set state.
    ZONE_ANCHOR_CHANGED: "editor:zone-anchor-changed",
} as const;
