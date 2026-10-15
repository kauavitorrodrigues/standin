export const ADMIN_SECTION_VALUES = {
    ASSETS: "assets",
    TILESETS: "tilesets",
    MAPS: "maps",
} as const;

export type AdminSection =
    (typeof ADMIN_SECTION_VALUES)[keyof typeof ADMIN_SECTION_VALUES];

export const DEFAULT_ADMIN_SECTION: AdminSection = ADMIN_SECTION_VALUES.ASSETS;

export const ADMIN_SECTIONS: {
    value: AdminSection;
    to: "/admin/assets" | "/admin/tilesets" | "/admin/maps";
}[] = [
    { value: ADMIN_SECTION_VALUES.ASSETS, to: "/admin/assets" },
    { value: ADMIN_SECTION_VALUES.TILESETS, to: "/admin/tilesets" },
    { value: ADMIN_SECTION_VALUES.MAPS, to: "/admin/maps" },
];
