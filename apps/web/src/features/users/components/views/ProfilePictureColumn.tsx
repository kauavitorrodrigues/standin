import { useProfilePictureUpload } from "../../hooks/useProfilePictureUpload";
import { ProfilePictureEmpty } from "./ProfilePictureEmpty";
import { ProfilePictureFilled } from "./ProfilePictureFilled";

// The profile picture of the person. With none, it is their initial and a drop
// zone that sends the photo right away. With one, the picture only shows a
// pencil to change and an X to remove while the pointer is over it.
export const ProfilePictureColumn = () => {
    const { isPending, upload, remove } = useProfilePictureUpload();

    return (
        <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-medium">Foto de perfil</span>
            <ProfilePictureEmpty onFile={upload} isPending={isPending} />
            <ProfilePictureFilled
                onFile={upload}
                onRemove={remove}
                isPending={isPending}
            />
        </div>
    );
};
