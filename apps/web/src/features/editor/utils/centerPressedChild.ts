// Scrolls a list so its pressed child sits in the middle of the view. It
// moves only the list, never the page. Meant as the ref of the list, so it
// runs once when the list mounts (a popover opening) and not on later
// renders: swapping the choice leaves the scroll where it is.
export const centerPressedChild = (list: HTMLElement | null): void => {
    const pressed = list?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!list || !pressed) return;

    list.scrollTop =
        pressed.offsetTop - (list.clientHeight - pressed.clientHeight) / 2;
};
