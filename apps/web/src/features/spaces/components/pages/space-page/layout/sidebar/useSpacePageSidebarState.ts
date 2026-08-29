import { useCallback, useState } from "react";

const SPACE_PAGE_SIDEBAR_STORAGE_KEY = "space_page_sidebar_open";

const getInitialSidebarOpen = () => {
    return localStorage.getItem(SPACE_PAGE_SIDEBAR_STORAGE_KEY) !== "false";
};

export const useSpacePageSidebarState = () => {
    const [open, setOpenState] = useState(getInitialSidebarOpen);

    const setOpen = useCallback((value: boolean) => {
        localStorage.setItem(SPACE_PAGE_SIDEBAR_STORAGE_KEY, String(value));
        setOpenState(value);
    }, []);

    return { open, setOpen };
};
