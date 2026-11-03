export const SETTINGS_SECTION_IDS = [
    "general",
    "audio",
    "video",
    "streaming",
    "notifications",
    "performance",
    "members",
    "guests",
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTION_IDS)[number];

export const DEFAULT_SETTINGS_SECTION: SettingsSectionId = "general";

// The sections that belong to the space the dialog was opened in. Outside a
// space they are not offered.
export const SPACE_SETTINGS_SECTIONS: readonly SettingsSectionId[] = [
    "members",
    "guests",
];

// Sections that fill the space and scroll inside themselves, so the content
// area does not scroll around them.
export const FILL_SETTINGS_SECTIONS: readonly SettingsSectionId[] = [
    "members",
    "guests",
];
