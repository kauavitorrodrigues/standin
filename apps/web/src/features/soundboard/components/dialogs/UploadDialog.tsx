import type { SoundboardClipScope } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { UploadClipForm } from "../forms/UploadForm";

type Props = {
    scope: SoundboardClipScope;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// Pick a file, trim it in the editor, and only then upload the result. The
// form mounts with the dialog, so every opening starts from nothing.
export const UploadClipDialog = ({ scope, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Novo clipe</DialogTitle>
                <DialogDescription>
                    Escolha um mp3, corte o trecho que quiser e envie. O arquivo
                    original não sai do seu navegador.
                </DialogDescription>
            </DialogHeader>
            <UploadClipForm scope={scope} onDone={() => onOpenChange(false)} />
        </DialogContent>
    </Dialog>
);
