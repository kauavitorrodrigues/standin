import { useState } from "react";

/** Whether the upload dialog is open. */
export const useClipUpload = () => {
    const [isOpen, setIsOpen] = useState(false);

    return { isOpen, open: () => setIsOpen(true), setIsOpen };
};
