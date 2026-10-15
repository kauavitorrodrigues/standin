import type { MapTemplate } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RenameTemplateForm } from "../forms/RenameForm";

type Props = {
    template: Pick<MapTemplate, "id" | "name" | "description">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const RenameTemplateDialog = ({
    template,
    open,
    onOpenChange,
}: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Renomear o template</DialogTitle>
                <DialogDescription>
                    O nome aparece na lista de templates e no editor.
                </DialogDescription>
            </DialogHeader>
            <RenameTemplateForm
                template={template}
                onDone={() => onOpenChange(false)}
            />
        </DialogContent>
    </Dialog>
);
