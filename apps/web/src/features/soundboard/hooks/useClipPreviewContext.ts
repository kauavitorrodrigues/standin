import { useContext } from "react";
import { ClipPreviewContext } from "../contexts/ClipPreviewContext";
import { SoundboardContextMissingError } from "../types/errors";

export const useClipPreviewContext = () => {
    const preview = useContext(ClipPreviewContext);
    if (!preview) throw new SoundboardContextMissingError();
    return preview;
};
