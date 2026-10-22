import type { z } from "zod/v4";
import type {
    SpaceInviteLinkCreatedSchema,
    SpaceInviteLinkSchema,
} from "../schemas/space-invite-link.schema";
import type {
    GuestSpaceSchema,
    SpaceGuestListSchema,
    SpaceGuestSchema,
    SpaceGuestStateSchema,
} from "../schemas/space-guest.schema";
import type {
    InvitePreviewSchema,
    InviteRequestResultSchema,
} from "../schemas/invite-preview.schema";
import type { SpaceViewSchema } from "../schemas/space-view.schema";

export type SpaceInviteLink = z.infer<typeof SpaceInviteLinkSchema>;
export type SpaceInviteLinkCreated = z.infer<
    typeof SpaceInviteLinkCreatedSchema
>;
export type SpaceGuest = z.infer<typeof SpaceGuestSchema>;
export type SpaceGuestList = z.infer<typeof SpaceGuestListSchema>;
export type SpaceGuestState = z.infer<typeof SpaceGuestStateSchema>;
export type GuestSpace = z.infer<typeof GuestSpaceSchema>;
export type InvitePreview = z.infer<typeof InvitePreviewSchema>;
export type InviteRequestResult = z.infer<typeof InviteRequestResultSchema>;
export type SpaceView = z.infer<typeof SpaceViewSchema>;

// The three events of the approval, sent over the socket.
export type SpaceGuestRequestedPayload = {
    guest: SpaceGuest;
};

export type SpaceGuestStatusPayload = SpaceGuestState;

// Something about the requests of the space changed (answered, expired,
// reopened). The hosts refresh their list from the server.
export type SpaceGuestUpdatedPayload = {
    spaceId: string;
};

export type SpaceGuestRemovedPayload = {
    spaceId: string;
    userId: string;
};
