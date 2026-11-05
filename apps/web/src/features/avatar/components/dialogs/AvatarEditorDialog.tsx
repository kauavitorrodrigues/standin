import { useRef, useState } from "react";
import type { ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { SaveDraftRef } from "../../types/draft";
import type { MyAvatar } from "../../types/editor";
import { AvatarEditorContent } from "../instances/AvatarEditorContent";
import { AvatarDiscardDialog } from "./AvatarDiscardDialog";

type AvatarEditorDialogProps = {
    // The trigger, a `DialogTrigger` that opens the editor. Missing when the
    // page opens it by `isOpen`.
    children?: ReactNode;
    // Lets the page open and close the editor. Without them it keeps its own
    // state and the trigger opens it.
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
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
    isOpen: isOpenProp,
    onOpenChange,
    onSaved,
}: AvatarEditorDialogProps) => {
    const [ownIsOpen, setOwnIsOpen] = useState(false);
    const isOpen = isOpenProp ?? ownIsOpen;
    const setIsOpen = (next: boolean) => {
        setOwnIsOpen(next);
        onOpenChange?.(next);
    };
    const [isDiscardOpen, setIsDiscardOpen] = useState(false);
    const isDirtyRef = useRef(false);
    const saveRef = useRef<SaveDraftRef["current"]>(null);

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

    // The discard dialog closes first so a failed save shows its toast over the
    // editor, which stays open with the draft intact.
    const save = async () => {
        setIsDiscardOpen(false);
        await saveRef.current?.();
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
                        saveRef={saveRef}
                        onDone={discard}
                        onSaved={onSaved}
                    />
                </DialogContent>
            </Dialog>
            <AvatarDiscardDialog
                open={isDiscardOpen}
                onOpenChange={setIsDiscardOpen}
                onConfirm={discard}
                onSave={() => void save()}
            />
        </>
    );
};
