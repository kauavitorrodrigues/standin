import { DECORATOR_FOCUS_KINDS } from "@/features/decorator/consts/focus-kinds";
import { NO_DECORATOR_FOCUS } from "@/features/decorator/consts/no-focus";
import type { DecorateAvailability } from "@/features/decorator/types/decorate-availability";
import type { DecoratorFocus } from "@/features/decorator/types/decorator-focus";
import { toProfileDecorate } from "@/features/decorator/utils/toProfileDecorate";
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
    // What the Decorar button does right now, and what it opens.
    decorateAvailability: DecorateAvailability;
    onDecorate: (focus: DecoratorFocus) => void;
    // The avatar is at its desk, so there is nowhere to walk to.
    isAtOwnDesk: boolean;
    onWalkToDesk: () => void;
};

// The profile of the person with the action to give their desk back.
export const OwnDeskProfileCard = ({
    spaceId,
    onClose,
    isMapLocked,
    decorateAvailability,
    onDecorate,
    isAtOwnDesk,
    onWalkToDesk,
}: OwnDeskProfileCardProps) => {
    const { user } = useAuth();
    const { desks } = useSpaceDesks(spaceId);
    const { releaseDesk, isPending } = useDeskActions(spaceId);

    const ownDesk = desks.find((desk) => desk.userId === user.id);

    const handleRelease = async () => {
        if (!ownDesk) return;
        await releaseDesk(ownDesk.mapAssetId);
    };

    // The decorator opens on the desk of the person, when they have one.
    const handleDecorate = () =>
        onDecorate(
            ownDesk
                ? { kind: DECORATOR_FOCUS_KINDS.DESK, id: ownDesk.mapAssetId }
                : NO_DECORATOR_FOCUS
        );

    return (
        <ProfileCard
            user={user}
            isOnline
            onClose={onClose}
            decorate={toProfileDecorate(decorateAvailability, handleDecorate)}
            actions={
                <DeskActions
                    disabled={!ownDesk || isPending || isMapLocked}
                    onRelease={handleRelease}
                    isWalkDisabled={!ownDesk || isAtOwnDesk}
                    onWalkToDesk={onWalkToDesk}
                />
            }
        />
    );
};
