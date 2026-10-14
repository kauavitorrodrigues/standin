import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { NewAreaForm } from "../forms/NewAreaForm";

export const NewAreaDialog = () => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="lg" />}>
                <PlusIcon />
                Nova área
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nova área</DialogTitle>
                    <DialogDescription>
                        Escolha o tamanho do bloco. Ele não muda depois de
                        criado.
                    </DialogDescription>
                </DialogHeader>
                <NewAreaForm onShowDialog={setOpen} />
            </DialogContent>
        </Dialog>
    );
};
