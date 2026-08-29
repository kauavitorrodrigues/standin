import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CreateOrganizationForm } from "../forms/CreateForm";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const CreateOrganizationDialog = ({ open, onOpenChange }: Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar organização</DialogTitle>
                    <DialogDescription>
                        Dê um nome para a sua organização.
                    </DialogDescription>
                </DialogHeader>
                <CreateOrganizationForm onShowDialog={onOpenChange} />
            </DialogContent>
        </Dialog>
    );
};
