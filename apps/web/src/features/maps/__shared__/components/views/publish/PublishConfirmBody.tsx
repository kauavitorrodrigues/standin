import {
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PublishLimitWarning } from "@/features/maps/__shared__/components/views/publish/PublishLimitWarning";

type PublishConfirmBodyProps = {
    opCount: number;
    nearLimit: boolean;
    onConfirm: () => void;
};

// The question before publishing, and the buttons to go ahead.
export const PublishConfirmBody = ({
    opCount,
    nearLimit,
    onConfirm,
}: PublishConfirmBodyProps) => (
    <>
        <AlertDialogHeader>
            <AlertDialogTitle>Publicar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
                Estas alterações passam a valer para todo mundo.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <PublishLimitWarning visible={nearLimit} opCount={opCount} />
        <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button type="button" onClick={onConfirm}>
                Publicar
            </Button>
        </AlertDialogFooter>
    </>
);
