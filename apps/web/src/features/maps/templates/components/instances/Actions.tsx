import { useState } from "react";
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { MapTemplate } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DELETE_MODES } from "../../consts/deleteModes";
import { getDeleteMode } from "../../utils/getDeleteMode";
import { DeleteTemplateDialog } from "../dialogs/DeleteDialog";
import { RenameTemplateDialog } from "../dialogs/RenameDialog";
import { DeleteBlockedHint } from "../views/card/DeleteBlockedHint";

type Props = { template: MapTemplate };

// The menu of a card: rename and delete.
export const TemplateActions = ({ template }: Props) => {
    const [renaming, setRenaming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const blocked = getDeleteMode(template.status) === DELETE_MODES.BLOCKED;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                >
                    <EllipsisVerticalIcon />
                    <span className="sr-only">Ações do template</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setRenaming(true)}>
                        <PencilIcon />
                        Renomear
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        disabled={blocked}
                        onClick={() => setDeleting(true)}
                    >
                        <Trash2Icon />
                        <span className="flex flex-col">
                            Apagar
                            <DeleteBlockedHint blocked={blocked} />
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <RenameTemplateDialog
                template={template}
                open={renaming}
                onOpenChange={setRenaming}
            />
            <DeleteTemplateDialog
                template={template}
                open={deleting}
                onOpenChange={setDeleting}
            />
        </>
    );
};
