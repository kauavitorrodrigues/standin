import { useClipUpload } from "../../hooks/useClipUpload";
import { useSoundboardLibrary } from "../../hooks/useSoundboardLibrary";
import { UploadClipDialog } from "../dialogs/UploadDialog";
import { UploadClipButton } from "../views/list/UploadButton";
import { LazyContent } from "../views/LazyContent";

// The button that adds a clip to the library of the screen, and its dialog:
// to the organization on its screens, where any member may add one, and to the
// default clips on the admin's.
export const ClipUpload = () => {
    const upload = useClipUpload();
    const { uploadScope } = useSoundboardLibrary();

    return (
        <>
            <UploadClipButton onClick={upload.open} />
            <LazyContent mounted={upload.isOpen}>
                <UploadClipDialog
                    scope={uploadScope}
                    open={upload.isOpen}
                    onOpenChange={upload.setIsOpen}
                />
            </LazyContent>
        </>
    );
};
