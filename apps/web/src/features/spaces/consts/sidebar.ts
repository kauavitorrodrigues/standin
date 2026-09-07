export const SPACE_PAGE_SIDEBAR_STORAGE_KEY = "space_page_sidebar_open";

export const SPACE_SIDEBAR_TABS = {
    CHAT: "chat",
    PEOPLE: "people",
} as const;

export type SpaceSidebarTab =
    (typeof SPACE_SIDEBAR_TABS)[keyof typeof SPACE_SIDEBAR_TABS];
