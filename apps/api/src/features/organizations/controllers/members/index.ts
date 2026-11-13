import { listMemberEntries } from "./entries";
import { leaveOrganization } from "./leave";
import { listMembers } from "./list";
import { removeMember } from "./remove";

export const MemberController = {
    list: listMembers,
    entries: listMemberEntries,
    remove: removeMember,
    leave: leaveOrganization,
};
