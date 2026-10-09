import type { KeyboardEvent } from "react";

// Enter and Space activate an element the same way a click does, so choosing
// it does not need a mouse.
export const activateOnKey =
    (onSelect: () => void) => (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onSelect();
    };
