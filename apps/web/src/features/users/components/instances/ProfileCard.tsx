import type { ReactNode } from "react";
import { useMinuteClock } from "../../hooks/useMinuteClock";
import { formatLocalTime } from "../../utils/formatLocalTime";
import { SpacePageLayout } from "@/features/spaces/components/pages/space-page/layout";
import type { ProfileDecorate } from "../../types/profileDecorate";
import { ProfileActions } from "../views/ProfileActions";
import { ProfileHeader } from "../views/ProfileHeader";

type ProfileCardProps = {
    user: { id: string; name: string; avatarUrl?: string | null };
    isOnline: boolean;
    onClose: () => void;
    actions: ReactNode;
    // The Decorar button, when the page that opened the card can decorate.
    decorate?: ProfileDecorate;
};

// The profile of the person, docked to the top right corner of the space.
export const ProfileCard = ({
    user,
    isOnline,
    onClose,
    actions,
    decorate,
}: ProfileCardProps) => {
    const now = useMinuteClock();

    return (
        <SpacePageLayout.FloatingCard className="absolute top-3 right-3 z-40 w-80 p-3">
            <ProfileHeader
                id={user.id}
                name={user.name}
                avatar={user.avatarUrl}
                isOnline={isOnline}
                localTime={formatLocalTime(now)}
                onClose={onClose}
            />
            <ProfileActions actions={actions} decorate={decorate} />
        </SpacePageLayout.FloatingCard>
    );
};
