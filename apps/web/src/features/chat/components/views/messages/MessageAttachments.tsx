import { DownloadIcon, FileIcon } from "lucide-react";
import type { MessageAttachment } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { resolveAttachmentUrl } from "@/features/chat/utils/attachmentUrl";
import { downloadAttachment } from "@/features/chat/utils/downloadAttachment";
import { AttachmentMessages } from "@/features/chat/components/forms/Messages";

type Props = { attachments: MessageAttachment[] };

const handleDownload = async (url: string, filename: string) => {
    try {
        await downloadAttachment(url, filename);
    } catch {
        toast.add({ title: AttachmentMessages.downloadError, type: "error" });
    }
};

export const MessageAttachments = ({ attachments }: Props) => {
    if (attachments.length === 0) return null;

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map(({ id, file }) => {
                const url = resolveAttachmentUrl(file);
                const isImage = file.mimeType.startsWith("image/");

                if (isImage) {
                    return (
                        <div
                            key={id}
                            className="group/attachment relative w-fit"
                        >
                            <a href={url} target="_blank" rel="noreferrer">
                                <img
                                    src={url}
                                    alt={file.originalName}
                                    className="max-h-48 max-w-64 rounded-md border border-input object-cover"
                                />
                            </a>
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon-sm"
                                aria-label={`Baixar ${file.originalName}`}
                                className="absolute top-1.5 right-1.5 opacity-0 shadow-sm transition-opacity group-hover/attachment:opacity-100"
                                onClick={() =>
                                    handleDownload(url, file.originalName)
                                }
                            >
                                <DownloadIcon />
                            </Button>
                        </div>
                    );
                }

                return (
                    <div
                        key={id}
                        className="flex items-center gap-1 rounded-md border border-input bg-muted/30 py-1 pr-1 pl-3 text-xs"
                    >
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex min-w-0 items-center gap-2 hover:underline"
                        >
                            <FileIcon className="size-4 shrink-0" />
                            <span className="max-w-48 truncate">
                                {file.originalName}
                            </span>
                        </a>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Baixar ${file.originalName}`}
                            onClick={() =>
                                handleDownload(url, file.originalName)
                            }
                        >
                            <DownloadIcon />
                        </Button>
                    </div>
                );
            })}
        </div>
    );
};
