// The panels of the editor and where their layout is kept in the browser. The
// ids tie a saved layout to the panel it belongs to.
export const TILE_EDITOR_LAYOUT_ID = "tile-editor-layout";
export const PROPERTIES_PANEL_ID = "properties";
export const EDITOR_PANEL_ID = "editor";

// The editor opens split 30% for the panel of properties and 70% for the
// editor. The panel can be pulled from 384 px to most of the screen, and folded
// to nothing, and the editor always keeps at least 320 px.
export const PROPERTIES_PANEL_DEFAULT_SIZE = "30%";
export const EDITOR_PANEL_DEFAULT_SIZE = "70%";
export const PROPERTIES_PANEL_MIN_SIZE = 384;
export const PROPERTIES_PANEL_MAX_SIZE = "80%";
export const EDITOR_PANEL_MIN_SIZE = 320;

// How long after the editor opens the panel starts to animate, in ms, so the
// size the browser kept is already in place and does not slide in.
export const PROPERTIES_PANEL_READY_MS = 150;

// How the panel folds and opens. It is set on the element that has the size
// (the outer one of the panel, which `elementRef` gives), since the class of
// the panel goes to the one inside it.
export const PROPERTIES_PANEL_TRANSITION = "flex-grow 150ms ease-out";
