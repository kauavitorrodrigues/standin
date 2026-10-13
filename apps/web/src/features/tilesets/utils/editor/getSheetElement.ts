// The sheet inside the area that scrolls: the area has room around it, so the
// sheet is not its first child.
export const getSheetElement = (scroller: HTMLElement): Element | null =>
    scroller.querySelector("[data-tile-sheet]");
