import type { AvatarPartRow } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getRowTitle } from "../../../utils/admin/getRowTitle";
import { PartPreview } from "../../instances/admin/PartPreview";

type Props = {
    part: AvatarPartRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const getRowDialogTitle = (part: AvatarPartRow): string =>
    part.colorKey === null ? part.name : `${part.name}, ${getRowTitle(part)}`;

export const PartPreviewDialog = ({ part, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{getRowDialogTitle(part)}</DialogTitle>
                <DialogDescription>
                    A peça sobre a base padrão, nas quatro direções. Cada cor da
                    peça tem a própria pré-visualização.
                </DialogDescription>
            </DialogHeader>
            <PartPreview part={part} />
        </DialogContent>
    </Dialog>
);
