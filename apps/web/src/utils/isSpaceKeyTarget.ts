// Elements that use the space bar themselves, so it must not pan over them.
export const isSpaceKeyTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;

    return target.closest("input, textarea, select, button, [contenteditable]")
        ? true
        : false;
};
