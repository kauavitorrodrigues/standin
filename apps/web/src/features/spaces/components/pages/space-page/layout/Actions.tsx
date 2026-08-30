import { useState } from "react";
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { Space } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpdateSpaceDialog } from "@/features/spaces/components/dialogs/UpdateDialog";
import { DeleteSpaceDialog } from "@/features/spaces/components/dialogs/DeleteDialog";

type Action = "update" | "delete" | null;

export const Actions = ({ space }: { space: Pick<Space, "id" | "name"> }) => {
    const [action, setAction] = useState<Action>(null);
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={<Button variant="secondary" size="icon" />}
                >
                    <EllipsisVerticalIcon />
                    <span className="sr-only">Ações do espaço</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setAction("update")}>
                        <PencilIcon />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setAction("delete")}
                    >
                        <Trash2Icon />
                        Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <UpdateSpaceDialog
                space={space}
                open={action === "update"}
                onOpenChange={() => setAction(null)}
            />
            <DeleteSpaceDialog
                space={space}
                open={action === "delete"}
                onOpenChange={() => setAction(null)}
            />
        </>
    );
};
