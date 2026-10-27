import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SpaceSettingsLoader } from "./SpaceSettingsLoader";

type Props = {
    spaceId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// The toggles of the space. Only the owner opens it.
export const SpaceSettingsDialog = ({ spaceId, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Configurações do espaço</DialogTitle>
                <DialogDescription>
                    Ajustes que valem para todas as pessoas neste espaço.
                </DialogDescription>
            </DialogHeader>
            <SpaceSettingsLoader
                spaceId={spaceId}
                onClose={() => onOpenChange(false)}
            />
        </DialogContent>
    </Dialog>
);
