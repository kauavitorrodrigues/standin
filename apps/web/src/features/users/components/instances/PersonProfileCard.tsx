import { PersonWaveButton } from "@/features/emotes/components/instances/PersonWaveButton";
import type { PersonWave } from "@/features/emotes/types/wave";
import { ListeningCard } from "@/features/spaces/music/listening/components/instances/ListeningCard";
import { SpacePageLayout } from "@/features/spaces/components/pages/space-page/layout";
import { useRemoteStatus } from "../../contexts/RemoteStatusesContext";
import { ProfileHeader } from "../views/ProfileHeader";

type PersonProfileCardProps = {
    person: { id: string; name: string; profilePictureUrl?: string | null };
    // Waves at the person. Left out where the viewer cannot wave, such as a
    // card shown without a game.
    wave?: PersonWave | null;
    onClose: () => void;
};

// The profile of another person, to look at: the photo, the name, whether they
// are available, what they are up to and what they are listening to. Its only
// action is to wave, since the buttons of the own profile edit or decorate
// things that are not theirs to touch. The person is in the space, since the
// card opens from their avatar.
export const PersonProfileCard = ({
    person,
    wave,
    onClose,
}: PersonProfileCardProps) => {
    const { availability, customStatus } = useRemoteStatus(person.id);

    return (
        <SpacePageLayout.FloatingCard className="w-full p-3">
            <ProfileHeader
                id={person.id}
                name={person.name}
                avatar={person.profilePictureUrl}
                isOnline
                availability={availability}
                customStatus={customStatus}
                onClose={onClose}
            />
            {wave && (
                <PersonWaveButton
                    key={person.id}
                    userId={person.id}
                    {...wave}
                />
            )}
            <ListeningCard userId={person.id} />
        </SpacePageLayout.FloatingCard>
    );
};
