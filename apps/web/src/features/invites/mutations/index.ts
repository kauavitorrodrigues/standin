import { useArchiveGuest } from "./archiveGuest";
import { useCancelInvitation } from "./cancelInvitation";
import { useCreateInvitations } from "./createInvitations";
import { useRemoveMember } from "./removeMember";
import { useResetOrganizationLink } from "./resetOrganizationLink";
import { useResetSpaceLink } from "./resetSpaceLink";
import { useSetGuestValidity } from "./setGuestValidity";

export const InviteMutations = {
    resetOrganizationLink: useResetOrganizationLink,
    resetSpaceLink: useResetSpaceLink,
    setGuestValidity: useSetGuestValidity,
    createInvitations: useCreateInvitations,
    cancelInvitation: useCancelInvitation,
    archiveGuest: useArchiveGuest,
    removeMember: useRemoveMember,
};
