import { useState } from "react";
import type { MessageWithDetails } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FormDialogControls } from "@/components/FormDialogControls";
import { toast } from "@/components/ui/toast";
import { useMessageList } from "@/features/chat/contexts/MessageListContext";
import { ChatMutations } from "@/features/chat/mutations";
import { DeleteMessageMessages } from "@/features/chat/components/forms/Messages";

type Props = {
    message: MessageWithDetails | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const DeleteMessageDialog = ({ message, open, onOpenChange }: Props) => {
    
    const deleteMessage = ChatMutations.delete();
    const { threadParentId } = useMessageList();

    // The dialog plays a closing transition after `open` goes false, during
    // which `message` may already have been cleared by the caller. Latching
    // the last non-null message (adjusted during render, same pattern as
    // useMessageGroups) keeps a valid delete target available for that whole
    // transition instead of the dialog needing to render with nothing to act
    // on.
    const [target, setTarget] = useState<MessageWithDetails | null>(null);
    if (message !== null && message !== target) setTarget(message);

    const handleDelete = async () => {
        if (!target) return;

        try {
            await deleteMessage.mutateAsync({
                conversationId: target.conversationId,
                messageId: target.id,
                threadParentId,
                isThreadReply: target.threadParentId !== null,
            });
            onOpenChange(false);
        } catch {
            toast.add({ title: DeleteMessageMessages.error, type: "error" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Excluir mensagem</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir essa mensagem? Essa ação
                        não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>
                <FormDialogControls
                    onSubmit={handleDelete}
                    onClose={() => onOpenChange(false)}
                    submitLabel="Excluir"
                    submitVariant="destructive"
                    isSubmitting={deleteMessage.isPending}
                />
            </DialogContent>
        </Dialog>
    );
};
