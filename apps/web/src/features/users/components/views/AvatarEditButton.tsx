import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";

// The pencil on the corner of the avatar circle. It opens the avatar editor
// shared with the bubble, via the `AvatarEditorDialog` wrapping both in AvatarColumn.
export const AvatarEditButton = () => (
    <DialogTrigger
        render={
            <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="absolute right-0 bottom-0 rounded-lg"
                aria-label="Editar avatar"
            />
        }
    >
        <PencilIcon />
    </DialogTrigger>
);
