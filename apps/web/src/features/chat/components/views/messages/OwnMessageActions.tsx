import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon } from "lucide-react";

type Props = { isOwn: boolean; onEdit: () => void; onDelete: () => void };

// Only the author can edit or delete a message, so this decides itself
// whether there is anything to render instead of the toolbar branching
// inline on `isOwn`.
export const OwnMessageActions = ({ isOwn, onEdit, onDelete }: Props) => {
    if (!isOwn) return null;

    return (
        <>
            <Button
                type="button"
                aria-label="Editar mensagem"
                onClick={onEdit}
                variant="ghost"
                className="flex size-6 text-muted-foreground"
            >
                <PencilIcon className="size-3.5" />
            </Button>
            <Button
                type="button"
                aria-label="Excluir mensagem"
                onClick={onDelete}
                variant="ghost"
                className="flex size-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
                <Trash2Icon className="size-3.5" />
            </Button>
        </>
    );
};
