import {
    DEFAULT_HEADER_TAB,
    HEADER_TABS,
    type HeaderTab,
} from "@/consts/headerTabs";

// The tab is the page the URL is on: /maps and everything under it (creating
// a map included) is the maps tab, anything else is the spaces tab.
export const resolveHeaderTab = (pathname: string): HeaderTab =>
    HEADER_TABS.find(
        ({ to, value }) =>
            value !== DEFAULT_HEADER_TAB &&
            (pathname === to || pathname.startsWith(`${to}/`))
    )?.value ?? DEFAULT_HEADER_TAB;
