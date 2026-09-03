import { useCallback, useState } from "react";
import {
    SPACE_PAGE_SIDEBAR_STORAGE_KEY,
    SPACE_SIDEBAR_TABS,
    type SpaceSidebarTab,
} from "@/features/spaces/consts/sidebar";

const getInitialSidebarOpen = () => {
    return localStorage.getItem(SPACE_PAGE_SIDEBAR_STORAGE_KEY) === "true";
};

export const useSpacePageSidebarState = () => {
    const [open, setOpenState] = useState(getInitialSidebarOpen);
    const [tab, setTab] = useState<SpaceSidebarTab>(SPACE_SIDEBAR_TABS.CHAT);

    const setOpen = useCallback((value: boolean) => {
        localStorage.setItem(SPACE_PAGE_SIDEBAR_STORAGE_KEY, String(value));
        setOpenState(value);
    }, []);

    // The bottom bar button of the tab already on screen closes the panel,
    // so the same button both opens and dismisses its own view.
    const selectTab = useCallback(
        (value: SpaceSidebarTab) => {
            setTab(value);
            setOpen(!(open && tab === value));
        },
        [open, tab, setOpen]
    );

    return { open, setOpen, tab, setTab, selectTab };
};
