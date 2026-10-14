import { useSyncExternalStore } from "react";
import { MAP_EDITOR_MIN_WIDTH_PX } from "@/features/maps/__shared__/consts/viewport";

const SMALL_SCREEN_QUERY = `(max-width: ${MAP_EDITOR_MIN_WIDTH_PX - 1}px)`;

const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia(SMALL_SCREEN_QUERY);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
};

const getSnapshot = () => window.innerWidth < MAP_EDITOR_MIN_WIDTH_PX;

// Outside a browser there is no viewport to measure: treated as large.
const getServerSnapshot = () => false;

export const useIsSmallScreen = () =>
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
