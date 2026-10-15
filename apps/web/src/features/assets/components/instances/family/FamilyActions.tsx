import { useState } from "react";
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type {
    LibraryFamilyDetail,
    LibraryFamilyVariant,
} from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FamilyDialogs } from "@/features/assets/components/dialogs/FamilyDialogs";
import type { FamilyAction } from "@/features/assets/types/familyActions";

type Props = {
    base: LibraryFamilyVariant;
    family: Pick<LibraryFamilyDetail, "variants">;
};

// Actions of the whole asset, on the base asset where the fields of the
// family live.
export const FamilyActions = ({ base, family }: Props) => {
    const [action, setAction] = useState<FamilyAction>(null);
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
                    <span className="sr-only">Ações do asset</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-50">
                    <DropdownMenuItem onClick={() => setAction("edit")}>
                        <PencilIcon />
                        Editar
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
            <FamilyDialogs
                base={base}
                family={family}
                action={action}
                onOpenChange={close}
            />
        </>
    );
};
