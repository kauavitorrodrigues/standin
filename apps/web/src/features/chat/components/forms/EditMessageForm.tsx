import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    MessageUpdateSchema,
    type MessageUpdateSchemaType,
    type MessageWithDetails,
} from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useMessageList } from "@/features/chat/contexts/MessageListContext";
import { ChatMutations } from "@/features/chat/mutations";
import { useMentionSuggestions } from "@/features/chat/hooks/useMentionSuggestions";
import { refreshMentionLabels } from "@/features/chat/utils/refreshMentionLabels";
import { MessageContentField } from "@/features/chat/components/fields/MessageContentField";
import { EditMessageMessages } from "@/features/chat/components/forms/Messages";

type Props = {
    message: MessageWithDetails;
    onCancel: () => void;
    onSaved: () => void;
};

export const EditMessageForm = ({ message, onCancel, onSaved }: Props) => {
    const updateMessage = ChatMutations.update();
    const { threadParentId } = useMessageList();
    const { suggestions } = useMentionSuggestions(message.conversationId);

    // Starts from the names people have now, which can differ from the stored
    // links after a rename.
    const initialContent = refreshMentionLabels(
        message.content ?? "",
        message.mentions
    );

    const form = useForm<MessageUpdateSchemaType>({
        resolver: zodResolver(MessageUpdateSchema),
        defaultValues: { content: initialContent },
    });

    const onSubmit = async ({ content }: MessageUpdateSchemaType) => {
        // Nothing the person changed: a rename alone is not an edit.
        if (content === initialContent) {
            onCancel();
            return;
        }
        try {
            await updateMessage.mutateAsync({
                conversationId: message.conversationId,
                messageId: message.id,
                threadParentId,
                content,
            });
            onSaved();
        } catch {
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
                suggestions={suggestions}
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
