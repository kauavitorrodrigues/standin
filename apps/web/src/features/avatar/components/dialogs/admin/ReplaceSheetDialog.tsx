import type { AvatarPartRow } from "@standin/contracts";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ReplaceSheetForm } from "../../forms/admin/ReplaceSheetForm";
import { ReplaceSheetTexts } from "../../views/admin/ReplaceSheetTexts";

type Props = {
    part: AvatarPartRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const ReplaceSheetDialog = ({ part, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <ReplaceSheetTexts />
            </DialogHeader>
            <ReplaceSheetForm part={part} onDone={() => onOpenChange(false)} />
        </DialogContent>
    </Dialog>
);
