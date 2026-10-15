import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ResumeAction } from "@/features/maps/__shared__/components/views/resume/ResumeAction";
import { ResumeDescription } from "@/features/maps/__shared__/components/views/resume/ResumeDescription";

type ResumeDraftDialogProps = {
    open: boolean;
    // The saved draft is from another version of the map.
    stale: boolean;
    onResume: () => void;
    onDiscard: () => void;
};

// Offered when the editor opens and finds a saved draft. It closes only by
// choosing, so the draft is never lost by a stray click.
export const ResumeDraftDialog = ({
    open,
    stale,
    onResume,
    onDiscard,
}: ResumeDraftDialogProps) => (
    <AlertDialog open={open}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Rascunho encontrado</AlertDialogTitle>
                <ResumeDescription stale={stale} />
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button type="button" variant="outline" onClick={onDiscard}>
                    Descartar
                </Button>
                <ResumeAction stale={stale} onResume={onResume} />
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
