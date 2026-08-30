import type { Space } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { UpdateSpaceForm } from "../forms/UpdateForm";

type Props = {
    space: Pick<Space, "id" | "name">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const UpdateSpaceDialog = ({ space, open, onOpenChange }: Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar espaço</DialogTitle>
                    <DialogDescription>
                        Altere o nome do seu espaço.
                    </DialogDescription>
                </DialogHeader>
                <UpdateSpaceForm space={space} onShowDialog={onOpenChange} />
            </DialogContent>
        </Dialog>
    );
};
