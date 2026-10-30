import { useState } from "react";
import type { DropEventLike } from "../types/upload";

type Options = { onDrop: (file: File) => void; disabled: boolean };

// Whether a file is being dragged over the area, and the handlers that take
// the first file dropped on it.
export const useDropFile = ({ onDrop, disabled }: Options) => {
    const [isOver, setIsOver] = useState(false);

    const onDragOver = (event: DropEventLike) => {
        event.preventDefault();
        setIsOver(!disabled);
    };

    const onDragLeave = () => setIsOver(false);

    const onDropFiles = (event: DropEventLike) => {
        event.preventDefault();
        setIsOver(false);
        if (disabled) return;

        const file = event.dataTransfer.files[0];
        if (file) onDrop(file);
    };

    return {
        isOver,
        handlers: { onDragOver, onDragLeave, onDrop: onDropFiles },
    };
};
