import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SoundboardManager } from "../instances/SoundboardManager";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

// The place to manage the clips of the organization. It is a dialog, like the
// other tools of the space menu (guests, settings): it opens over the space
// without leaving it. The list inside mounts with the dialog, so the clips are
// fetched when it is opened.
export const SoundboardManagerDialog = ({ open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>Soundboard</DialogTitle>
                <DialogDescription>
                    Os clipes da organização e os padrões. Ouça, envie novos e,
                    nos seus, edite ou apague.
                </DialogDescription>
            </DialogHeader>
            <SoundboardManager />
        </DialogContent>
    </Dialog>
);
