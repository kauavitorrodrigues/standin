import type { MapEntity } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { UpdateMapForm } from "../forms/UpdateForm";

type Props = {
    map: MapEntity;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const UpdateMapDialog = ({ map, open, onOpenChange }: Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar mapa</DialogTitle>
                    <DialogDescription>
                        Altere os dados do seu mapa.
                    </DialogDescription>
                </DialogHeader>
                <UpdateMapForm map={map} onShowDialog={onOpenChange} />
            </DialogContent>
        </Dialog>
    );
};
