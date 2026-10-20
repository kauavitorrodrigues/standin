import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type DeletedPartRowProps = {
    isDeleted: boolean;
    onRemove: () => void;
};

// The slot holds a part that left the catalog. It still shows in the avatar,
// but it is not in the grid, so this row is the way to take it off.
export const DeletedPartRow = ({
    isDeleted,
    onRemove,
}: DeletedPartRowProps) => {
    if (!isDeleted) return null;

    return (
        <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
            <span className="text-muted-foreground">
                A peça escolhida não está mais disponível.
            </span>
            <Button
                type="button"
                size="sm"
                variant="outline"
                icon={XIcon}
                onClick={onRemove}
            >
                Remover
            </Button>
        </div>
    );
};
