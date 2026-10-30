import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SERVICE_TOKEN_CREATE_TEXT } from "../../consts/messages";
import { CreateServiceTokenForm } from "../forms/CreateServiceTokenForm";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (token: string) => void;
};

export const CreateServiceTokenDialog = ({
    open,
    onOpenChange,
    onCreated,
}: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>{SERVICE_TOKEN_CREATE_TEXT.TITLE}</DialogTitle>
                <DialogDescription>
                    {SERVICE_TOKEN_CREATE_TEXT.DESCRIPTION}
                </DialogDescription>
            </DialogHeader>
            <CreateServiceTokenForm onCreated={onCreated} />
        </DialogContent>
    </Dialog>
);
