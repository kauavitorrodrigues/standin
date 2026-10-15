import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
    EllipsisVerticalIcon,
    EyeIcon,
    PencilIcon,
    Trash2Icon,
} from "lucide-react";
import type { LibraryTilesetSummary } from "@standin/contracts";
import type { TilesetAction } from "../../types/actions";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TilesetActionDialogs } from "../dialogs/ActionDialogs";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";

type Props = { tileset: LibraryTilesetSummary };

// The menu of a card: see its details, rename or delete.
export const TilesetActions = ({ tileset }: Props) => {
    const { paths } = useLibraryScope();
    const [action, setAction] = useState<TilesetAction>(null);
    const close = (next: boolean) => {
        if (!next) setAction(null);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                >
                    <EllipsisVerticalIcon />
                    <span className="sr-only">Ações do tileset</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                        render={
                            <Link
                                to={paths.tileset}
                                params={{ tilesetId: tileset.id }}
                            />
                        }
                    >
                        <EyeIcon />
                        Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAction("rename")}>
                        <PencilIcon />
                        Renomear
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setAction("delete")}
                    >
                        <Trash2Icon />
                        Apagar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <TilesetActionDialogs
                tileset={tileset}
                action={action}
                onOpenChange={close}
            />
        </>
    );
};
