import { XIcon } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";

type Props = {
    onRemove: () => void;
    disabled: boolean;
};

// Only a person who has a picture can remove it. It sits in the middle of the
// picture, away from the pencil on the corner that changes it.
// It shows only while the pointer is over the picture (the parent is a
// Tailwind `group`). Focus inside the group must not show it: the window
// focuses its first control when it opens, and the X would appear by itself.
// Only a keyboard focus on the X itself shows it, so the keyboard still reaches
// it. A touch screen has no hover, so there it is always shown. The X only
// asks: the picture is removed when the person confirms in the dialog.
export const RemoveProfilePictureButton = ({ onRemove, disabled }: Props) => {
    const { user } = useAuth();

    if (!user.profilePictureUrl) return null;

    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon-lg"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-transparent bg-destructive text-white opacity-0 shadow-md group-hover:opacity-100 hover:bg-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-foreground dark:bg-destructive dark:hover:bg-destructive [@media(hover:none)]:opacity-100"
                        aria-label="Remover foto"
                        disabled={disabled}
                        icon={XIcon}
                    />
                }
            />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remover foto de perfil?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Sua foto sai do seu perfil, do chat e do jogo, e volta a
                        aparecer a inicial do seu nome. Você pode enviar outra
                        foto quando quiser.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        render={<Button variant="destructive" />}
                        disabled={disabled}
                        onClick={onRemove}
                    >
                        Remover
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
