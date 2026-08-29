import { useState } from "react";
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { Space } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getSpaceGradient } from "@/features/spaces/utils/gradient";
import { UpdateSpaceDialog } from "@/features/spaces/components/dialogs/UpdateDialog";
import { DeleteSpaceDialog } from "@/features/spaces/components/dialogs/DeleteDialog";

export function SpaceCard({ space }: { space: Space }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
        <div className="group flex cursor-pointer flex-col gap-2">
            <div
                className="relative aspect-video w-full rounded-xl transition-opacity hover:opacity-90"
                style={{ backgroundImage: getSpaceGradient(space.id) }}
            >
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="secondary"
                                size="icon-sm"
                                className={cn(
                                    "absolute top-2 right-2 bg-background/70 opacity-0 backdrop-blur-sm hover:bg-background group-hover:opacity-100",
                                    isMenuOpen && "opacity-100",
                                )}
                            />
                        }
                    >
                        <EllipsisVerticalIcon />
                        <span className="sr-only">Ações do espaço</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => setIsUpdateDialogOpen(true)}
                        >
                            <PencilIcon />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <Trash2Icon />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <span className="px-1 text-sm font-medium">{space.name}</span>

            <UpdateSpaceDialog
                space={space}
                open={isUpdateDialogOpen}
                onOpenChange={setIsUpdateDialogOpen}
            />
            <DeleteSpaceDialog
                space={space}
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            />
        </div>
    );
}
