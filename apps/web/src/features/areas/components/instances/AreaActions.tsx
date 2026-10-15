import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
    EllipsisVerticalIcon,
    PencilIcon,
    SquarePenIcon,
    Trash2Icon,
} from "lucide-react";
import type { AreaSummary } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AreaAction } from "../../types/actions";
import { AreaActionDialogs } from "../dialogs/ActionDialogs";

type Props = { area: AreaSummary };

// The menu of a card: edit, rename or delete.
export const AreaActions = ({ area }: Props) => {
    const [action, setAction] = useState<AreaAction>(null);
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
                    <span className="sr-only">Ações da área</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                        render={
                            <Link
                                to="/admin/areas/$areaId/edit"
                                params={{ areaId: area.id }}
                            />
                        }
                    >
                        <SquarePenIcon />
                        Editar
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
            <AreaActionDialogs
                area={area}
                action={action}
                onOpenChange={close}
            />
        </>
    );
};
