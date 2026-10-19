import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemPreview,
} from "@/components/ui/file-upload";

const renderLargeImage = (file: File) => (
    <img
        src={URL.createObjectURL(file)}
        alt=""
        className="size-full object-contain [image-rendering:pixelated]"
        onLoad={(event) => URL.revokeObjectURL(event.currentTarget.src)}
    />
);

// The chosen image alone, big and centered in the place of the dropzone, with
// only a small button to remove it.
export const LargeFileUploadItem = ({ file }: { file: File }) => (
    <FileUploadItem
        value={file}
        className="bg-muted/30 h-72 justify-center p-6"
    >
        <FileUploadItemPreview
            render={renderLargeImage}
            className="size-full"
        />
        <FileUploadItemDelete
            render={
                <Button
                    variant="secondary"
                    size="icon-sm"
                    className="absolute top-2 right-2"
                >
                    <XIcon />
                </Button>
            }
        />
    </FileUploadItem>
);
