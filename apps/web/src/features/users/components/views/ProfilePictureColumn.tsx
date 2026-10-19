import { useAuth } from "@/features/auth/hooks/useAuth";
import { UserAvatar } from "../UserAvatar";

// The profile picture of the person, which is their initial on a flat color
// until the server stores pictures. There is no pencil here for that reason.
export const ProfilePictureColumn = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-medium">Foto de perfil</span>
            <UserAvatar
                id={user.id}
                name={user.name}
                size="xl"
                className="size-22"
            />
        </div>
    );
};
