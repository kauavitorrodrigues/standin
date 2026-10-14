import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileCard } from "@/features/users/components/instances/ProfileCard";
import { useDeskActions } from "../../hooks/useDeskActions";
import { useSpaceDesks } from "../../queries/useSpaceDesks";
import { DeskActions } from "../views/DeskActions";

type OwnDeskProfileCardProps = {
    spaceId: string;
    onClose: () => void;
    // A map being edited refuses desk changes.
    isMapLocked: boolean;
};

// The profile of the person with the action to give their desk back.
export const OwnDeskProfileCard = ({
    spaceId,
    onClose,
    isMapLocked,
}: OwnDeskProfileCardProps) => {
    const { user } = useAuth();
    const { desks } = useSpaceDesks(spaceId);
    const { releaseDesk, isPending } = useDeskActions(spaceId);

    const ownDesk = desks.find((desk) => desk.userId === user.id);

    const handleRelease = async () => {
        if (!ownDesk) return;
        await releaseDesk(ownDesk.mapAssetId);
    };

    return (
        <ProfileCard
            user={user}
            isOnline
            onClose={onClose}
            actions={
                <DeskActions
                    disabled={!ownDesk || isPending || isMapLocked}
                    onRelease={handleRelease}
                />
            }
        />
    );
};
