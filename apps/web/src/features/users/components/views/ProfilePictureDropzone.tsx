import { useState } from "react";
import type { DragEvent, KeyboardEvent, ReactNode } from "react";
import { usePictureChooser } from "../../hooks/usePictureChooser";
import { HiddenPictureInput } from "./HiddenPictureInput";

type Props = {
    onFile: (file: File) => void;
    disabled: boolean;
    children: ReactNode;
};

// The picture of a person who has none yet, as a drop zone: a click, the
// pencil inside it or a dropped image opens or feeds the file chooser right
// away. With a picture the zone is gone (see `ProfilePictureFilled`). One file
// at a time. Whatever is dropped goes on to `onFile`, which refuses what is not
// an accepted image.
export const ProfilePictureDropzone = ({
    onFile,
    disabled,
    children,
}: Props) => {
    const { inputRef, openChooser, handleChange } = usePictureChooser(onFile);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(!disabled);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const [file] = event.dataTransfer.files;
        if (file && !disabled) onFile(file);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return;
        if (event.key !== "Enter" && event.key !== " ") return;

        event.preventDefault();
        openChooser();
    };

    const draggingAttribute = isDragging ? "" : undefined;

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label="Escolher foto de perfil"
            aria-disabled={disabled}
            data-dragging={draggingAttribute}
            className="relative cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:pointer-events-none data-dragging:ring-2 data-dragging:ring-primary"
            onClick={openChooser}
            onKeyDown={handleKeyDown}
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <HiddenPictureInput
                inputRef={inputRef}
                disabled={disabled}
                onChange={handleChange}
            />
            {children}
        </div>
    );
};
