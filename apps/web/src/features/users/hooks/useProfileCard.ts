import { useState } from "react";

// Whether the profile card is open. The page owns it, since a desk opens it
// and the card sits on its own corner of the page.
export const useProfileCard = () => {
    const [isOpen, setIsOpen] = useState(false);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
    };
};
