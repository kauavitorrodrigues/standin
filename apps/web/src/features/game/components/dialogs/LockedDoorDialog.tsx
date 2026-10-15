import { useEffect } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { LockedDoorPrompt as Prompt } from "@/features/game/types/locked-door";
import { acquireGameInputLock } from "@/features/game/utils/inputLock";

type LockedDoorDialogProps = {
    prompt: Prompt | null;
    onRequest: () => void;
    onCancel: () => void;
};

// Asks the person at a locked door whether to request entry, then waits.
export const LockedDoorDialog = ({
    prompt,
    onRequest,
    onCancel,
}: LockedDoorDialogProps) => {
    if (prompt === null) return null;

    return (
        <OpenLockedDoorDialog
            prompt={prompt}
            onRequest={onRequest}
            onCancel={onCancel}
        />
    );
};

type OpenProps = Omit<LockedDoorDialogProps, "prompt"> & { prompt: Prompt };

// Mounted only while the dialog is open, so the game input lock is held
// exactly for that time and the avatar does not move behind the dialog.
const OpenLockedDoorDialog = ({ prompt, onRequest, onCancel }: OpenProps) => {
    useEffect(() => acquireGameInputLock(), []);

    return (
        <AlertDialog
            open
            onOpenChange={(next) => {
                if (!next) onCancel();
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reunião em andamento</AlertDialogTitle>
                    <PromptDescription prompt={prompt} />
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button type="button" variant="outline" onClick={onCancel}>
                        {getDismissLabel(prompt.status)}
                    </Button>
                    <RequestButton status={prompt.status} onClick={onRequest} />
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

const PromptDescription = ({ prompt }: { prompt: Prompt }) => {
    switch (prompt.status) {
        case "sent":
            return (
                <AlertDialogDescription>
                    Pedido enviado. Aguardando resposta de quem está na sala.
                </AlertDialogDescription>
            );
        case "declined":
            return (
                <AlertDialogDescription>
                    Seu pedido de entrada foi recusado.
                </AlertDialogDescription>
            );
        default:
            return (
                <AlertDialogDescription>
                    Esta reunião está acontecendo. Pedir para entrar em{" "}
                    <span className="font-medium">{prompt.roomLabel}</span>?
                </AlertDialogDescription>
            );
    }
};

// A declined request has nothing left to cancel, the person just closes it.
const getDismissLabel = (status: Prompt["status"]): string => {
    switch (status) {
        case "declined":
            return "Fechar";
        default:
            return "Cancelar";
    }
};

const RequestButton = ({
    status,
    onClick,
}: {
    status: Prompt["status"];
    onClick: () => void;
}) => {
    if (status !== "asking") return null;

    return (
        <Button type="button" onClick={onClick}>
            Pedir para entrar
        </Button>
    );
};
