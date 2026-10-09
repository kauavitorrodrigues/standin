export const HEADER_TAB_VALUES = {
    SPACES: "spaces",
    MAPS: "maps",
} as const;

export type HeaderTab =
    (typeof HEADER_TAB_VALUES)[keyof typeof HEADER_TAB_VALUES];

export const DEFAULT_HEADER_TAB: HeaderTab = HEADER_TAB_VALUES.SPACES;

export const HEADER_TABS: {
    value: HeaderTab;
    to: "/home" | "/maps";
}[] = [
    { value: HEADER_TAB_VALUES.SPACES, to: "/home" },
    { value: HEADER_TAB_VALUES.MAPS, to: "/maps" },
];
