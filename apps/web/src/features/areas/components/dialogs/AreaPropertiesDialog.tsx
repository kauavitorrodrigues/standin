import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AreaNameField } from "../forms/AreaNameField";
import { AreaZoneBox } from "../forms/AreaZoneBox";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// The properties of the area inside the composer. The fields are the ones of the
// composer form, so what changes here is saved with the area.
export const AreaPropertiesDialog = ({ open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Propriedades da área</DialogTitle>
                <DialogDescription>
                    O nome e a zona valem quando você salvar a área.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-6">
                <AreaNameField />
                <AreaZoneBox />
            </div>
            <DialogFooter>
                <Button type="button" onClick={() => onOpenChange(false)}>
                    Concluir
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
