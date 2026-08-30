import { useState } from "react";
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { MapEntity } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpdateMapDialog } from "@/features/maps/components/dialogs/UpdateDialog";
import { DeleteMapDialog } from "@/features/maps/components/dialogs/DeleteDialog";

type MapAction = "update" | "delete" | null;

export const MapActions = ({ map }: { map: MapEntity }) => {
    const [action, setAction] = useState<MapAction>(null);
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="secondary"
                            size="icon-sm"
                            className="absolute top-2 right-2 bg-background/70 opacity-0 backdrop-blur-sm hover:bg-background data-popup-open:opacity-100 group-hover:opacity-100"
                        />
                    }
                >
                    <EllipsisVerticalIcon />
                    <span className="sr-only">Ações do mapa</span>
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
            <UpdateMapDialog
                map={map}
                open={action === "update"}
                onOpenChange={() => setAction(null)}
            />
            <DeleteMapDialog
                map={map}
                open={action === "delete"}
                onOpenChange={() => setAction(null)}
            />
        </>
    );
};
