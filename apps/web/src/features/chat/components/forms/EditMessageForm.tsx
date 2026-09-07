import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    MessageUpdateSchema,
    type MessageUpdateSchemaType,
    type MessageWithDetails,
} from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ChatMutations } from "@/features/chat/mutations";
import { MessageContentField } from "@/features/chat/components/fields/MessageContentField";
import { EditMessageMessages } from "@/features/chat/components/forms/Messages";
import { usePeerChat } from "@/features/chat/contexts/PeerChatContext";

type Props = {
    message: MessageWithDetails;
    onCancel: () => void;
    onSaved: () => void;
};

export const EditMessageForm = ({ message, onCancel, onSaved }: Props) => {
    const updateMessage = ChatMutations.update();
    const { broadcastEdit } = usePeerChat();

    const form = useForm<MessageUpdateSchemaType>({
        resolver: zodResolver(MessageUpdateSchema),
        defaultValues: { content: message.content ?? "" },
    });

    const onSubmit = async ({ content }: MessageUpdateSchemaType) => {
        // Fired alongside the API call, same reasoning as
        // broadcastChatMessage: peers already connected see the edit
        // instantly over the mesh instead of waiting for a manual refresh.
        broadcastEdit(
            message.conversationId,
            message.id,
            content,
            new Date().toISOString()
        );

        try {
            await updateMessage.mutateAsync({
                conversationId: message.conversationId,
                messageId: message.id,
                content,
            });
            onSaved();
        } catch {
            // The edit never made it to the server, so tell peers who
            // already applied it over the mesh to revert to the content
            // they had before this attempt.
            broadcastEdit(
                message.conversationId,
                message.id,
                message.content ?? "",
                message.editedAt ?? new Date().toISOString()
            );
            toast.add({ title: EditMessageMessages.error, type: "error" });
        }
    };

    const submit = form.handleSubmit(onSubmit);
    const { isSubmitting } = form.formState;

    return (
        <form
            onSubmit={submit}
            className="flex flex-col gap-1.5 rounded-md border border-input bg-background p-2"
        >
            <MessageContentField
                control={form.control}
                name="content"
                disabled={isSubmitting}
                onSubmit={submit}
            />
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                    Salvar
                </Button>
            </div>
        </form>
    );
};
