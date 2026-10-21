import { useAuth } from "@/features/auth/hooks/useAuth";
import { UserAvatar } from "../UserAvatar";
import { PendingPictureOverlay } from "./PendingPictureOverlay";
import { ProfilePictureDropzone } from "./ProfilePictureDropzone";
import { ProfilePictureEditButton } from "./ProfilePictureEditButton";

type Props = {
    onFile: (file: File) => void;
    isPending: boolean;
};

// The picture of a person who has none: their initial, as a drop zone. A click
// on it, on the pencil or a dropped image opens or feeds the file chooser.
export const ProfilePictureEmpty = ({ onFile, isPending }: Props) => {
    const { user } = useAuth();

    if (user.profilePictureUrl) return null;

    return (
        <div className="relative">
            <ProfilePictureDropzone onFile={onFile} disabled={isPending}>
                <UserAvatar
                    id={user.id}
                    name={user.name}
                    size="xl"
                    className="size-22"
                />
                <PendingPictureOverlay isPending={isPending} />
                <ProfilePictureEditButton disabled={isPending} />
            </ProfilePictureDropzone>
        </div>
    );
};
