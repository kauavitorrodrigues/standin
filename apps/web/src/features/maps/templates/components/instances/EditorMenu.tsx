import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PencilIcon, Trash2Icon } from "lucide-react";
import type { MapTemplate } from "@standin/contracts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TemplatePublishMenuItem } from "./PublishMenuItem";
import { TemplateRetireMenuItem } from "./RetireMenuItem";
import { DELETE_MODES } from "../../consts/deleteModes";
import { getDeleteMode } from "../../utils/getDeleteMode";
import { EditorDeleteDialog } from "./EditorDeleteDialog";
import { PublishTemplateDialog } from "../dialogs/PublishDialog";
import { RenameTemplateDialog } from "../dialogs/RenameDialog";
import { RetireTemplateDialog } from "../dialogs/RetireDialog";

type Props = { template: MapTemplate };

// The name of the template in the title bar. It opens rename, publish, retire and delete.
export const TemplateEditorMenu = ({ template }: Props) => {
    const navigate = useNavigate();
    const [renaming, setRenaming] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [retiring, setRetiring] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const blocked = getDeleteMode(template.status) === DELETE_MODES.BLOCKED;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    aria-label="Ações do template"
                    className="hover:bg-accent min-w-0 cursor-pointer truncate rounded-md px-1.5 py-1"
                >
                    {template.name}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuItem onClick={() => setRenaming(true)}>
                        <PencilIcon />
                        Renomear
                    </DropdownMenuItem>
                    <TemplatePublishMenuItem
                        template={template}
                        onSelect={() => setPublishing(true)}
                    />
                    <TemplateRetireMenuItem
                        template={template}
                        onSelect={() => setRetiring(true)}
                    />
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        disabled={blocked}
                        onClick={() => setDeleting(true)}
                    >
                        <Trash2Icon />
                        Apagar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <PublishTemplateDialog
                template={template}
                open={publishing}
                onOpenChange={setPublishing}
            />
            <RetireTemplateDialog
                template={template}
                open={retiring}
                onOpenChange={setRetiring}
            />
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
