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
import { ChatMutations } from "@/features/chat/mutations";
import { DeleteMessageMessages } from "@/features/chat/components/forms/Messages";
import { usePeerChat } from "@/features/chat/contexts/PeerChatContext";

type Props = {
    message: MessageWithDetails | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const DeleteMessageDialog = ({ message, open, onOpenChange }: Props) => {
    
    const deleteMessage = ChatMutations.delete();
    const { broadcastDelete, broadcastChatMessage } = usePeerChat();

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

        // Fired alongside the API call, same reasoning as
        // broadcastChatMessage: peers already connected see the deletion
        // instantly over the mesh instead of waiting for a manual refresh.
        broadcastDelete(target.conversationId, target.id);

        try {
            await deleteMessage.mutateAsync({
                conversationId: target.conversationId,
                messageId: target.id,
            });
            onOpenChange(false);
        } catch {
            // The deletion never made it to the server, so tell peers who
            // already removed the message over the mesh to bring it back.
            // Reusing the CHAT frame means peers restore it via
            // prependMessage, i.e. at the newest position rather than its
            // original spot in history: an accepted gap in this rare
            // failure path (the API call itself failing), not a P2P-only
            // guarantee, since a reload always shows the true, persisted
            // order anyway.
            broadcastChatMessage(target.conversationId, target);
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
