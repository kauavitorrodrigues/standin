import type { DeskChoice } from "./desk";

// What decides whether the send button is on.
export type SendInvitationsInput = {
    emailCount: number;
    isDeskRequested: boolean;
    desk: DeskChoice;
};
