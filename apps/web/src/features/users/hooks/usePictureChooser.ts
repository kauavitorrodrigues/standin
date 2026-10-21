import { useRef } from "react";
import type { ChangeEvent } from "react";

// The hidden file input behind a picture, and what opens and reads it. The
// same file chosen twice must still fire a change, so the value is cleared.
export const usePictureChooser = (onFile: (file: File) => void) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const openChooser = () => inputRef.current?.click();

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const [file] = event.target.files ?? [];
        event.target.value = "";
        if (file) onFile(file);
    };

    return { inputRef, openChooser, handleChange };
};
