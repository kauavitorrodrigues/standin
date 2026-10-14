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
import { CreateTemplateForm } from "../forms/CreateForm";

export const CreateTemplateDialog = () => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="lg" />}>
                <PlusIcon />
                Novo template
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo template</DialogTitle>
                    <DialogDescription>
                        Crie um template com um mapa em branco.
                    </DialogDescription>
                </DialogHeader>
                <CreateTemplateForm onShowDialog={setOpen} />
            </DialogContent>
        </Dialog>
    );
};
