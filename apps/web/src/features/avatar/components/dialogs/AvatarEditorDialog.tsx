import { useRef, useState } from "react";
import type { ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { MyAvatar } from "../../types/editor";
import { AvatarEditorContent } from "../instances/AvatarEditorContent";
import { AvatarDiscardDialog } from "./AvatarDiscardDialog";

type AvatarEditorDialogProps = {
    // The trigger, a `DialogTrigger` that opens the editor.
    children: ReactNode;
    // Called with the saved avatar. The game does not need it: saving updates
    // the cached avatar, which redraws the local player (useLocalAvatarSheet),
    // and the server tells the other players.
    onSaved?: (avatar: MyAvatar) => void;
};

// The "Editar avatar" window. The content only exists while it is open, so
// every opening starts a new draft from the avatar the person has now. Closing
// it with changes (Esc, outside click, the X or Cancel) asks before throwing
// them away.
export const AvatarEditorDialog = ({
    children,
    onSaved,
}: AvatarEditorDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDiscardOpen, setIsDiscardOpen] = useState(false);
    const isDirtyRef = useRef(false);

    const handleOpenChange = (next: boolean) => {
        if (!next && isDirtyRef.current) {
            setIsDiscardOpen(true);
            return;
        }
        setIsOpen(next);
    };

    const discard = () => {
        setIsDiscardOpen(false);
        isDirtyRef.current = false;
        setIsOpen(false);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                {children}
                <DialogContent className="sm:max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Editar avatar</DialogTitle>
                        <DialogDescription className="sr-only">
                            Escolha as peças e as cores do seu avatar.
                        </DialogDescription>
                    </DialogHeader>
                    <AvatarEditorContent
                        isDirtyRef={isDirtyRef}
                        onDone={discard}
                        onSaved={onSaved}
                    />
                </DialogContent>
            </Dialog>
            <AvatarDiscardDialog
                open={isDiscardOpen}
                onOpenChange={setIsDiscardOpen}
                onConfirm={discard}
            />
        </>
    );
};
