import { useState, type ReactElement } from "react";
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
import { CreateSpaceForm } from "../forms/CreateForm";

type Props = {
    trigger?: ReactElement;
};

export const CreateSpaceDialog = ({ trigger }: Props) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    trigger ?? (
                        <Button variant="outline" size="lg">
                            <PlusIcon />
                            Criar espaço
                        </Button>
                    )
                }
            />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar espaço</DialogTitle>
                    <DialogDescription>
                        Dê um nome para o seu espaço.
                    </DialogDescription>
                </DialogHeader>
                <CreateSpaceForm onShowDialog={setOpen} />
            </DialogContent>
        </Dialog>
    );
};
