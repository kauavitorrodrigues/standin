import { Loader2Icon } from "lucide-react";
import {
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Waiting for the server. There are no buttons: it ends by itself.
export const PublishProgressBody = () => (
    <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
            <Loader2Icon className="size-4 animate-spin" />
            Publicando...
        </AlertDialogTitle>
        <AlertDialogDescription>
            Não feche esta janela até terminar.
        </AlertDialogDescription>
    </AlertDialogHeader>
);
