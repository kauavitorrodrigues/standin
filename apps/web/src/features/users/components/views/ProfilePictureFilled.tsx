import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePictureChooser } from "../../hooks/usePictureChooser";
import { UserAvatar } from "../UserAvatar";
import { HiddenPictureInput } from "./HiddenPictureInput";
import { PendingPictureOverlay } from "./PendingPictureOverlay";
import { ProfilePictureEditButton } from "./ProfilePictureEditButton";
import { RemoveProfilePictureButton } from "./RemoveProfilePictureButton";

type Props = {
    onFile: (file: File) => void;
    onRemove: () => void;
    isPending: boolean;
};

// The picture of a person who has one. It is not a drop zone: the picture
// itself does nothing on a click or a drop. The pencil on the corner is always
// shown and opens the file chooser, so a new photo replaces the current one.
// The X that removes shows in the middle only while the pointer is over the
// picture.
export const ProfilePictureFilled = ({
    onFile,
    onRemove,
    isPending,
}: Props) => {
    const { user } = useAuth();
    const { inputRef, openChooser, handleChange } = usePictureChooser(onFile);

    if (!user.profilePictureUrl) return null;

    return (
        <div className="group relative rounded-full">
            <UserAvatar
                id={user.id}
                name={user.name}
                avatar={user.profilePictureUrl}
                size="xl"
                className="size-22"
            />
            <PendingPictureOverlay isPending={isPending} />
            <HiddenPictureInput
                inputRef={inputRef}
                disabled={isPending}
                onChange={handleChange}
            />
            <ProfilePictureEditButton
                disabled={isPending}
                onClick={openChooser}
            />
            <RemoveProfilePictureButton
                onRemove={onRemove}
                disabled={isPending}
            />
        </div>
    );
};
