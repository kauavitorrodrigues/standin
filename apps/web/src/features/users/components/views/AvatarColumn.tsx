import { DialogTrigger } from "@/components/ui/dialog";
import { AvatarEditorDialog } from "@/features/avatar/components/dialogs/AvatarEditorDialog";
import { OwnAvatarBubble } from "../instances/OwnAvatarBubble";
import { AvatarEditButton } from "./AvatarEditButton";

// The avatar of the person in a circle, with the pencil that opens the editor.
// The bubble itself is also a trigger, so clicking it opens the same editor.
export const AvatarColumn = () => (
    <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-medium">Avatar</span>
        <AvatarEditorDialog>
            <div className="relative">
                <DialogTrigger
                    render={
                        <button
                            type="button"
                            className="rounded-full"
                            aria-label="Editar avatar"
                        />
                    }
                >
                    <OwnAvatarBubble />
                </DialogTrigger>
                <AvatarEditButton />
            </div>
        </AvatarEditorDialog>
    </div>
);
