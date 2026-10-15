import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
import { EditorDeleteDialog } from "./EditorDeleteDialog";
import { RenameTemplateDialog } from "../dialogs/RenameDialog";
import { DeleteBlockedHint } from "../views/card/DeleteBlockedHint";

type Props = { template: MapTemplate };

// The less frequent actions of the editor of a template: rename and delete.
export const TemplateEditorMenu = ({ template }: Props) => {
    const navigate = useNavigate();
    const [renaming, setRenaming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const blocked = getDeleteMode(template.status) === DELETE_MODES.BLOCKED;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" />}
                >
                    <EllipsisVerticalIcon />
                    <span className="sr-only">Ações do template</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
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
            <EditorDeleteDialog
                template={template}
                open={deleting}
                onOpenChange={setDeleting}
                onDeleted={() => navigate({ to: "/admin/maps" })}
            />
        </>
    );
};
