import type { ReactNode } from "react";
import { useMinuteClock } from "../../hooks/useMinuteClock";
import { formatLocalTime } from "../../utils/formatLocalTime";
import { SpacePageLayout } from "@/features/spaces/components/pages/space-page/layout";
import type { ProfileDecorate } from "../../types/profileDecorate";
import { ProfileActions } from "../views/ProfileActions";
import { ProfileHeader } from "../views/ProfileHeader";

type ProfileCardProps = {
    user: { id: string; name: string; profilePictureUrl?: string | null };
    isOnline: boolean;
    onClose: () => void;
    actions: ReactNode;
    // The Decorar button, when the page that opened the card can decorate.
    decorate?: ProfileDecorate;
};

// The profile of the person. It sits in the right stack of the space, where the
// other floating cards line up under it.
export const ProfileCard = ({
    user,
    isOnline,
    onClose,
    actions,
    decorate,
}: ProfileCardProps) => {
    const now = useMinuteClock();

    return (
        <SpacePageLayout.FloatingCard className="w-full p-3">
            <ProfileHeader
                id={user.id}
                name={user.name}
                avatar={user.profilePictureUrl}
                isOnline={isOnline}
                localTime={formatLocalTime(now)}
                onClose={onClose}
            />
            <ProfileActions actions={actions} decorate={decorate} />
        </SpacePageLayout.FloatingCard>
    );
};
