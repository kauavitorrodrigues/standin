import { useEffect, useRef } from "react";
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
import { MessageComposerFrame } from "@/features/chat/components/layout/MessageComposerFrame";
import { MessageComposerToolbar } from "@/features/chat/components/layout/MessageComposerToolbar";
import { MessageAttachmentPreviewList } from "@/features/chat/components/layout/MessageAttachmentPreviewList";
import { SendMessageMessages } from "@/features/chat/components/forms/Messages";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePeerChat } from "@/features/chat/contexts/PeerChatContext";
import { TYPING_STOP_DELAY_MS } from "@/features/chat/consts/typing";
import {
    buildTempMessage,
    createPeerMessageId,
} from "@/features/chat/utils/tempMessage";
import {
    canSendMessage,
    hasTypedContent,
} from "@/features/chat/utils/sendMessageForm";

type Props = { conversationId: string };

export const SendMessageForm = ({ conversationId }: Props) => {
    
    const { user } = useAuth();
    const sendMessage = ChatMutations.send();
    
    const {
        broadcastChatMessage,
        broadcastTyping,
        broadcastConfirm,
        broadcastDelete,
    } = usePeerChat();
    
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const composerFrameRef = useRef<HTMLDivElement | null>(null);

    const form = useForm<SendMessageFormInput, unknown, SendMessageFormOutput>({
        resolver: zodResolver(SendMessageFormSchema),
        defaultValues: { content: "", attachments: [] },
    });

    const onSubmit = async ({
        content,
        attachments,
    }: SendMessageFormOutput) => {
        // Fired alongside the API call, not chained after it: peers already
        // connected get the message instantly over the mesh, while the HTTP
        // request persists it in parallel for history/offline participants.
        // Attachments aren't broadcast over the data channel. Their sender
        // sees them right away via the optimistic mutation below, everyone
        // else picks them up from the persisted message on next fetch.
        const tempId = createPeerMessageId();
        if (attachments.length === 0) {
            // Guaranteed non-empty here: the form schema requires content
            // when there are no attachments.
            const peerMessage = buildTempMessage({
                id: tempId,
                conversationId,
                senderId: user.id,
                content: content ?? "",
            });
            broadcastChatMessage(conversationId, peerMessage);
        }

        try {
            const message = await sendMessage.mutateAsync({
                conversationId,
                content,
                attachments,
            });
            form.reset({ content: "", attachments: [] });
            // Swaps the temporary id peers are rendering for the real
            // persisted row, so they can react/edit/delete it right away
            // instead of only after their next manual refresh.
            if (attachments.length === 0) {
                broadcastConfirm(conversationId, tempId, message);
            }
        } catch {
            // The message never made it to the server, so tell peers who
            // already rendered it over the mesh to drop it too. Reuses the
            // delete payload: those peers already have a row keyed by
            // tempId with senderId === user.id, so the same authorship
            // guard used for a real delete lets it through.
            if (attachments.length === 0) {
                broadcastDelete(conversationId, tempId);
            }
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

    const submit = form.handleSubmit(onSubmit);
    const { isSubmitting } = form.formState;
    const content = useWatch({ control: form.control, name: "content" });
    const attachments = useWatch({ control: form.control, name: "attachments" });
    const canSend = canSendMessage({
        isSubmitting,
        content,
        attachmentCount: attachments.length,
    });

    // Debounced by effect cleanup: every keystroke clears the previous
    // stop-typing timer and starts a new one, so typing:false only goes out
    // once the user has been idle for TYPING_STOP_DELAY_MS.
    useEffect(() => {
        if (!hasTypedContent(content)) {
            broadcastTyping(conversationId, false);
            return;
        }

        broadcastTyping(conversationId, true);
        const timeoutId = setTimeout(() => {
            broadcastTyping(conversationId, false);
        }, TYPING_STOP_DELAY_MS);

        return () => clearTimeout(timeoutId);
    }, [content, conversationId, broadcastTyping]);

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
