export const CATEGORY_TAB_ATTRIBUTE = "data-category-tab";

// How far a key moves the focus along the rail, in categories. Null for a key
// that is not for the rail. Home and End jump to the ends.
const getStep = (key: string, count: number): number | null => {
    switch (key) {
        case "ArrowUp":
            return -1;
        case "ArrowDown":
            return 1;
        case "Home":
            return -count;
        case "End":
            return count;
        default:
            return null;
    }
};

// Moves the focus between the categories of the rail with the up and down
// keys, stopping at the first and the last. The focus moves and nothing is
// chosen: Enter or a click opens the category, as with the tiles of the grid.
// Returns whether the key was handled.
export const moveCategoryFocus = (
    container: HTMLElement,
    key: string
): boolean => {
    const tabs = Array.from(
        container.querySelectorAll<HTMLElement>(`[${CATEGORY_TAB_ATTRIBUTE}]`)
    );
    const step = getStep(key, tabs.length);
    if (step === null) return false;

    const current = tabs.indexOf(document.activeElement as HTMLElement);
    if (current === -1) return false;

    const next = Math.min(tabs.length - 1, Math.max(0, current + step));
    tabs[next]?.focus();
    return true;
};
