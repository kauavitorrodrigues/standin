import { CircleCheckIcon } from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SERVICE_TOKEN_CREATED_TEXT } from "../../consts/messages";
import { CreatedTokenBody } from "../views/CreatedTokenBody";

type Props = {
    // The clear token, or null with the dialog closed.
    token: string | null;
    // Defaults to the title of a new token.
    title?: string;
    onClose: () => void;
};

// Shows the clear token once. Escape and a click outside do nothing, only
// the button closes it, so the token is not lost by accident.
export const CreatedTokenDialog = ({
    token,
    title = SERVICE_TOKEN_CREATED_TEXT.TITLE,
    onClose,
}: Props) => (
    <AlertDialog open={token !== null}>
        <AlertDialogContent className="sm:max-w-lg">
            <AlertDialogHeader className="items-center text-center">
                <CircleCheckIcon
                    aria-hidden
                    className="size-12 text-emerald-600 dark:text-emerald-400"
                />
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>
                    {SERVICE_TOKEN_CREATED_TEXT.USAGE}
                </AlertDialogDescription>
            </AlertDialogHeader>
            {token !== null && <CreatedTokenBody token={token} />}
            <AlertDialogFooter>
                <Button type="button" onClick={onClose}>
                    {SERVICE_TOKEN_CREATED_TEXT.CLOSE}
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
