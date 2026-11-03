import { useAcceptInvitation } from "./acceptInvitation";
import { useLeaveSession } from "./leaveSession";

export const InviteLinkMutations = {
    accept: useAcceptInvitation,
    leaveSession: useLeaveSession,
};
