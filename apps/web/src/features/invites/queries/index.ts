import { useFreeDesks } from "./freeDesks";
import { useGuestEntries } from "./guestEntries";
import { useInvitations } from "./invitations";
import { useMemberEntries } from "./memberEntries";
import { useOrganizationFixedLink } from "./organizationFixedLink";
import { useSpaceFixedLink } from "./spaceFixedLink";

export const InviteQueries = {
    useOrganizationFixedLink,
    useSpaceFixedLink,
    useInvitations,
    useMemberEntries,
    useGuestEntries,
    useFreeDesks,
};
