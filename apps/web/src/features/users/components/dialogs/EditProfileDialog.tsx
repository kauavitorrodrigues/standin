import { useRef } from "react";
import type { ReactNode } from "react";
import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EditProfileForm } from "../forms/EditProfileForm";

type Props = {
    // The trigger, a `DialogTrigger` that opens the window.
    children: ReactNode;
};

// The "Editar perfil" window: profile picture, avatar and name. The form only
// exists while it is open, so every opening starts from what is saved.
export const EditProfileDialog = ({ children }: Props) => {
    const actionsRef = useRef<DialogPrimitive.Root.Actions>(null);

    return (
        <Dialog actionsRef={actionsRef}>
            {children}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar perfil</DialogTitle>
                    <DialogDescription className="sr-only">
                        Troque seu nome e edite seu avatar.
                    </DialogDescription>
                </DialogHeader>
                <EditProfileForm onDone={() => actionsRef.current?.close()} />
            </DialogContent>
        </Dialog>
    );
};
