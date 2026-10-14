import {
    DEFAULT_EDITOR_VIEW_PREFERENCES,
    EDITOR_VIEW_PREFERENCES_STORAGE_KEY,
    type EditorViewPreferences,
} from "@/features/maps/__shared__/consts/editorViewPreferences";
import { createLocalPreference } from "@/lib/createLocalPreference";

const parseEditorViewPreferences = (stored: unknown): EditorViewPreferences => {
    if (typeof stored !== "object" || stored === null)
        return DEFAULT_EDITOR_VIEW_PREFERENCES;

    const record = stored as Record<string, unknown>;
    const defaults = DEFAULT_EDITOR_VIEW_PREFERENCES;
    return {
        gridVisible:
            typeof record.gridVisible === "boolean"
                ? record.gridVisible
                : defaults.gridVisible,
        zonesVisible:
            typeof record.zonesVisible === "boolean"
                ? record.zonesVisible
                : defaults.zonesVisible,
    };
};

export const editorViewPreference = createLocalPreference({
    key: EDITOR_VIEW_PREFERENCES_STORAGE_KEY,
    fallback: DEFAULT_EDITOR_VIEW_PREFERENCES,
    parse: parseEditorViewPreferences,
});
