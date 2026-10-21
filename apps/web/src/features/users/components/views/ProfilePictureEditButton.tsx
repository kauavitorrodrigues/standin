import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// The pencil on the corner of the picture, always shown. Without a picture it
// sits inside the drop zone, so its click reaches the zone and opens the file
// chooser. With a picture there is no zone, so the pencil opens the chooser
// itself through `onClick`, and the new photo replaces the current one.
export const ProfilePictureEditButton = ({
    disabled,
    onClick,
}: {
    disabled: boolean;
    onClick?: () => void;
}) => {
    return (
        <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute right-0 bottom-0 rounded-lg"
            aria-label="Editar foto de perfil"
            disabled={disabled}
            onClick={onClick}
            icon={PencilIcon}
        />
    );
};
