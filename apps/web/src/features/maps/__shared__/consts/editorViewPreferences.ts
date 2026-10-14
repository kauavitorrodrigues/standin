export type EditorViewPreferences = {
    gridVisible: boolean;
    zonesVisible: boolean;
};

export const DEFAULT_EDITOR_VIEW_PREFERENCES: EditorViewPreferences = {
    gridVisible: true,
    zonesVisible: true,
};

export const EDITOR_VIEW_PREFERENCES_STORAGE_KEY =
    "map_editor_view_preferences";
