import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { EditProfileDialog } from "../dialogs/EditProfileDialog";

// The Editar perfil button of the profile card. It opens the window with the
// profile picture, the avatar and the name.
export const EditProfileButton = () => (
    <EditProfileDialog>
        <DialogTrigger
            render={
                <Button
                    type="button"
                    icon={UserIcon}
                    className="flex-1"
                    size="lg"
                />
            }
        >
            Editar perfil
        </DialogTrigger>
    </EditProfileDialog>
);
