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

type Props = {
    message: MessageWithDetails;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const DeleteMessageDialog = ({ message, open, onOpenChange }: Props) => {
    const deleteMessage = ChatMutations.delete();

    const handleDelete = async () => {
        try {
            await deleteMessage.mutateAsync({
                conversationId: message.conversationId,
                messageId: message.id,
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
