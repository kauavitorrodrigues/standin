export const SETTINGS_SECTION_IDS = [
    "general",
    "audio",
    "video",
    "streaming",
    "notifications",
    "performance",
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTION_IDS)[number];

export const DEFAULT_SETTINGS_SECTION: SettingsSectionId = "general";
