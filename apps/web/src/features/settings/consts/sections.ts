export const SETTINGS_SECTION_IDS = [
    "general",
    "audio",
    "video",
    "streaming",
    "notifications",
    "ambient",
    "integrations",
    "performance",
    "members",
    "guests",
    "conversations",
    "security",
    "apps",
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTION_IDS)[number];

export const DEFAULT_SETTINGS_SECTION: SettingsSectionId = "general";

// The sections that belong to the space the dialog was opened in. Outside a
// space they are not offered.
export const SPACE_SETTINGS_SECTIONS: readonly SettingsSectionId[] = [
    "integrations",
    "members",
    "guests",
    "conversations",
    "security",
    "apps",
];

// Sections that fill the space and scroll inside themselves, so the content
// area does not scroll around them.
export const FILL_SETTINGS_SECTIONS: readonly SettingsSectionId[] = [
    "members",
    "guests",
];
