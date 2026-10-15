import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type LockDeniedDialogProps = {
    // "Em edição por Ana desde 14:32".
    description: string;
    onExit: () => void;
};

// Shown when someone else holds the lock. The editor does not open behind
// it, so the only way out is to go back.
export const LockDeniedDialog = ({
    description,
    onExit,
}: LockDeniedDialogProps) => (
    <AlertDialog open>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Mapa em edição</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button type="button" onClick={onExit}>
                    Voltar
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
