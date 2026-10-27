import { useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontalIcon } from "lucide-react";
import {
    CHAT_ATTACHMENT_MIME_TYPES,
    MAX_MESSAGE_ATTACHMENTS,
    MAX_UPLOAD_SIZE_IN_BYTES,
    SendMessageFormSchema,
    type SendMessageFormInput,
    type SendMessageFormOutput,
} from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { FileUpload } from "@/components/ui/file-upload";
import { ChatMutations } from "@/features/chat/mutations";
import { MessageContentField } from "@/features/chat/components/fields/MessageContentField";
import { ShowInChannelField } from "@/features/chat/components/fields/ShowInChannelField";
import { MessageComposerFrame } from "@/features/chat/components/layout/MessageComposerFrame";
import { MessageComposerToolbar } from "@/features/chat/components/layout/MessageComposerToolbar";
import { MessageAttachmentPreviewList } from "@/features/chat/components/layout/MessageAttachmentPreviewList";
import { SendMessageMessages } from "@/features/chat/components/forms/Messages";
import { usePeerChat } from "@/features/chat/contexts/PeerChatContext";
import { useTypingBroadcast } from "@/features/chat/hooks/useTypingBroadcast";
import {
    canSendMessage,
    getComposerPlaceholder,
} from "@/features/chat/utils/sendMessageForm";

type Props = {
    conversationId: string;
    // Makes the form the composer of that thread, so what it sends is a reply.
    threadParentId?: string;
};

export const SendMessageForm = ({ conversationId, threadParentId }: Props) => {
    
    const sendMessage = ChatMutations.send();
    
    const { broadcastTyping } = usePeerChat();
    
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const composerFrameRef = useRef<HTMLDivElement | null>(null);

    const form = useForm<SendMessageFormInput, unknown, SendMessageFormOutput>({
        resolver: zodResolver(SendMessageFormSchema),
        defaultValues: {
            content: "",
            attachments: [],
            showThreadReplyInChannel: false,
        },
    });

    const onSubmit = async ({
        content,
        attachments,
        showThreadReplyInChannel,
    }: SendMessageFormOutput) => {
        try {
            await sendMessage.mutateAsync({
                conversationId,
                content,
                attachments,
                threadParentId,
                showThreadReplyInChannel: showThreadReplyInChannel === true,
            });
            // The channel choice stays, a run of replies usually wants the same.
            form.reset({
                content: "",
                attachments: [],
                showThreadReplyInChannel: showThreadReplyInChannel === true,
            });
        } catch {
            toast.add({ title: SendMessageMessages.error, type: "error" });
        } finally {
            // The textarea is disabled while isSubmitting, which the
            // browser blurs on its own, so without this the composer loses
            // focus to whatever's behind it (the game canvas) on every
            // single send. One frame after the field re-enables, so
            // focus() lands after the DOM actually reflects that.
            requestAnimationFrame(() => textareaRef.current?.focus());
        }
    };

    const placeholder = getComposerPlaceholder(threadParentId);
    const submit = form.handleSubmit(onSubmit);
    const { isSubmitting } = form.formState;
    const content = useWatch({ control: form.control, name: "content" });
    const attachments = useWatch({ control: form.control, name: "attachments" });
    const canSend = canSendMessage({
        isSubmitting,
        content,
        attachmentCount: attachments.length,
    });

    useTypingBroadcast({ conversationId, content, broadcastTyping });

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
        <form onSubmit={submit} className="mt-4 shrink-0">
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
                                placeholder={placeholder}
                                onSubmit={submit}
                                onTextareaRef={(element) => {
                                    textareaRef.current = element;
                                }}
                            />
                            <ShowInChannelField
                                control={form.control}
                                name="showThreadReplyInChannel"
                                isThreadReply={threadParentId !== undefined}
                                disabled={isSubmitting}
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
