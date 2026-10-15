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
import { TemplatePublishMenuItem } from "./PublishMenuItem";
import { TemplateRetireMenuItem } from "./RetireMenuItem";
import { DELETE_MODES } from "../../consts/deleteModes";
import { getDeleteMode } from "../../utils/getDeleteMode";
import { DeleteTemplateDialog } from "../dialogs/DeleteDialog";
import { PublishTemplateDialog } from "../dialogs/PublishDialog";
import { RenameTemplateDialog } from "../dialogs/RenameDialog";
import { RetireTemplateDialog } from "../dialogs/RetireDialog";

type Props = { template: MapTemplate };

// The menu of a card: rename, publish, retire and delete.
export const TemplateActions = ({ template }: Props) => {
    const [renaming, setRenaming] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [retiring, setRetiring] = useState(false);
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
                <DropdownMenuContent align="end" className="w-40">
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
            <DeleteTemplateDialog
                template={template}
                open={deleting}
                onOpenChange={setDeleting}
            />
        </>
    );
};
