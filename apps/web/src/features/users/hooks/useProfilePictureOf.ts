import { useAuth } from "@/features/auth/hooks/useAuth";
import { OrganizationsQueries } from "@/features/organizations/queries";

// The profile picture of one person, for the places that only know their id
// (a desk, a video tile). The person themselves come from the signed in user,
// which is the copy that changes the moment they save; everyone else comes
// from the members of the organization, which the live update refreshes.
export const useProfilePictureOf = (
    userId: string | null | undefined
): string | null => {
    const { user } = useAuth();
    const { members } = OrganizationsQueries.useMembers();

    if (!userId) return null;
    if (userId === user.id) return user.profilePictureUrl;

    return (
        members.find((member) => member.id === userId)?.profilePictureUrl ??
        null
    );
};
