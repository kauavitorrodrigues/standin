import { useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontalIcon } from "lucide-react";
import { z } from "zod/v4";
import {
    CHAT_ATTACHMENT_MIME_TYPES,
    MAX_MESSAGE_ATTACHMENTS,
    MAX_UPLOAD_SIZE_IN_BYTES,
    MessageDataSchema,
} from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { FileUpload } from "@/components/ui/file-upload";
import { ChatMutations } from "@/features/chat/mutations";
import { MessageContentField } from "@/features/chat/components/fields/MessageContentField";
import { MessageComposerFrame } from "@/features/chat/components/layout/MessageComposerFrame";
import { MessageComposerToolbar } from "@/features/chat/components/layout/MessageComposerToolbar";
import { MessageAttachmentPreviewList } from "@/features/chat/components/layout/MessageAttachmentPreviewList";
import { SendMessageMessages } from "@/features/chat/components/forms/Messages";

const SendMessageFormSchema = MessageDataSchema.extend({
    attachments: z.array(z.instanceof(File)).max(MAX_MESSAGE_ATTACHMENTS),
});
type SendMessageFormSchemaType = z.infer<typeof SendMessageFormSchema>;

type Props = { conversationId: string };

export const SendMessageForm = ({ conversationId }: Props) => {
    const sendMessage = ChatMutations.send();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const composerFrameRef = useRef<HTMLDivElement | null>(null);

    const form = useForm<SendMessageFormSchemaType>({
        resolver: zodResolver(SendMessageFormSchema),
        defaultValues: { content: "", attachments: [] },
    });

    const onSubmit = async ({
        content,
        attachments,
    }: SendMessageFormSchemaType) => {
        form.reset({ content: "", attachments: [] });
        try {
            await sendMessage.mutateAsync({
                conversationId,
                content,
                attachments,
            });
        } catch {
            toast.add({ title: SendMessageMessages.error, type: "error" });
        }
    };

    const submit = form.handleSubmit(onSubmit);
    const { isSubmitting } = form.formState;
    const content = useWatch({ control: form.control, name: "content" });
    const canSend = !isSubmitting && (content ?? "").trim().length > 0;

    const insertEmoji = (emoji: string) => {
        const textarea = textareaRef.current;
        const current = content ?? "";
        const start = textarea?.selectionStart ?? current.length;
        const end = textarea?.selectionEnd ?? current.length;
        const next = current.slice(0, start) + emoji + current.slice(end);

        form.setValue("content", next, {
            shouldDirty: true,
            shouldValidate: true,
        });

        requestAnimationFrame(() => {
            textarea?.focus();
            const cursor = start + emoji.length;
            textarea?.setSelectionRange(cursor, cursor);
        });
    };

    return (
        <form onSubmit={submit} className="shrink-0">
            <Controller
                control={form.control}
                name="attachments"
                render={({ field }) => (
                    <FileUpload
                        value={field.value}
                        onValueChange={field.onChange}
                        onFileReject={() =>
                            toast.add({
                                title: SendMessageMessages.attachmentRejected,
                                type: "error",
                            })
                        }
                        accept={CHAT_ATTACHMENT_MIME_TYPES.join(",")}
                        maxFiles={MAX_MESSAGE_ATTACHMENTS}
                        maxSize={MAX_UPLOAD_SIZE_IN_BYTES}
                        multiple
                        disabled={isSubmitting}
                    >
                        <MessageComposerFrame ref={composerFrameRef}>
                            <MessageAttachmentPreviewList
                                files={field.value}
                            />
                            <MessageContentField
                                control={form.control}
                                name="content"
                                disabled={isSubmitting}
                                onSubmit={submit}
                                onTextareaRef={(element) => {
                                    textareaRef.current = element;
                                }}
                            />
                            <div className="flex items-center justify-between">
                                <MessageComposerToolbar
                                    onInsertEmoji={insertEmoji}
                                    composerFrameRef={composerFrameRef}
                                />
                                <Button
                                    type="submit"
                                    size="icon-lg"
                                    className="rounded-full"
                                    aria-label="Enviar mensagem"
                                    disabled={!canSend}
                                >
                                    <SendHorizontalIcon />
                                </Button>
                            </div>
                        </MessageComposerFrame>
                    </FileUpload>
                )}
            />
        </form>
    );
};
