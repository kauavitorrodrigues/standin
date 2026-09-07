import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemPreview,
} from "@/components/ui/file-upload";

type Props = { files: File[] };

// Sits inside the composer's FileUpload root: each row still owns its own
// remove action, dispatched through the FileUpload store, which is kept in
// sync with the form's `attachments` field via its controlled `value` prop.
export const MessageAttachmentPreviewList = ({ files }: Props) => {
    if (files.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {files.map((file) => (
                <FileUploadItem
                    key={`${file.name}-${file.lastModified}-${file.size}`}
                    value={file}
                    className="w-auto gap-2 p-1.5 pr-2"
                >
                    <FileUploadItemPreview className="size-8" />
                    <span className="max-w-32 truncate text-xs">
                        {file.name}
                    </span>
                    <FileUploadItemDelete
                        render={
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Remover anexo"
                            />
                        }
                    >
                        <XIcon />
                    </FileUploadItemDelete>
                </FileUploadItem>
            ))}
        </div>
    );
};
