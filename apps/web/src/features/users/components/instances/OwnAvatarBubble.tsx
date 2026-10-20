import { AvatarFrameBubble } from "@/features/avatar/components/views/AvatarFrameBubble";
import { AVATAR_BUBBLE } from "@/features/avatar/consts/bubble";
import { useMyAvatar } from "@/features/avatar/queries/useMyAvatar";
import { Skeleton } from "@/components/ui/skeleton";

// The avatar the person has now, read from the server. The sheet id changes on
// every save, so the circle follows the editor without any extra step.
export const OwnAvatarBubble = () => {
    const { data } = useMyAvatar();

    if (!data) {
        return (
            <Skeleton
                className="rounded-full"
                style={{
                    width: AVATAR_BUBBLE.SIZE_PX,
                    height: AVATAR_BUBBLE.SIZE_PX,
                }}
            />
        );
    }

    return <AvatarFrameBubble sheetFileId={data.avatarSheetFileId} />;
};
