import { z } from "zod/v4";
import { normalizeEmail } from "../../__shared__";
import { InviteErrorMessages } from "./consts/invite-error-messages";

export const MAX_INVITATIONS_PER_REQUEST = 50;
export const ORGANIZATION_INVITATION_LIFETIME_DAYS = 30;

// An invitation by e-mail carries this prefix, so a token tells which table to
// look in without trying both.
export const ORGANIZATION_INVITATION_TOKEN_PREFIX = "inv_";

export const isOrganizationInvitationToken = (token: string): boolean =>
    token.startsWith(ORGANIZATION_INVITATION_TOKEN_PREFIX);

const EmailSchema = z
    .string()
    .transform(normalizeEmail)
    .pipe(z.email({ error: InviteErrorMessages.email.invalid }));

// The e-mails the owner typed, already split by comma, and the desk kept for
// them. A desk needs the space it is in.
export const OrganizationInvitationCreateSchema = z
    .object({
        emails: z
            .array(EmailSchema)
            .min(1, { error: InviteErrorMessages.emails.required })
            .max(MAX_INVITATIONS_PER_REQUEST, {
                error: InviteErrorMessages.emails.tooMany,
            }),
        spaceId: z.string().min(1).nullable().default(null),
        mapAssetId: z.string().min(1).nullable().default(null),
    })
    .refine((data) => !data.mapAssetId || !!data.spaceId, {
        error: InviteErrorMessages.desk.needsSpace,
        path: ["spaceId"],
    });

export type OrganizationInvitationCreateInput = z.infer<
    typeof OrganizationInvitationCreateSchema
>;

// What a client sends: the schema fills in the defaults and cleans the e-mails.
export type OrganizationInvitationCreateRequest = z.input<
    typeof OrganizationInvitationCreateSchema
>;

export const OrganizationInvitationSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    email: z.string(),
    spaceId: z.string().nullable(),
    mapAssetId: z.string().nullable(),
    createdBy: z.string().nullable(),
    expiresAt: z.iso.datetime(),
    createdAt: z.iso.datetime(),
    // Only the owner who made it sees the token, to copy the link.
    token: z.string(),
});

export type OrganizationInvitation = z.infer<
    typeof OrganizationInvitationSchema
>;

// What the page of an e-mail invitation shows.
export const OrganizationInvitationPreviewSchema = z.object({
    organizationName: z.string(),
    inviterName: z.string().nullable(),
    email: z.string(),
});

export type OrganizationInvitationPreview = z.infer<
    typeof OrganizationInvitationPreviewSchema
>;

// A person of the organization, for the owner's list.
export const OrganizationMemberEntrySchema = z.object({
    userId: z.string(),
    name: z.string(),
    email: z.string(),
    profilePictureUrl: z.string().nullable(),
    isOwner: z.boolean(),
    joinedAt: z.iso.datetime(),
});

export type OrganizationMemberEntry = z.infer<
    typeof OrganizationMemberEntrySchema
>;

// The fixed link of the organization, with the token to copy.
export const OrganizationFixedLinkSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    token: z.string(),
    createdAt: z.iso.datetime(),
});

export type OrganizationFixedLink = z.infer<typeof OrganizationFixedLinkSchema>;

// A desk of a space that nobody holds, to keep for an invited person.
export const FreeDeskSchema = z.object({
    mapAssetId: z.string(),
    name: z.string(),
    tileX: z.number().int(),
    tileY: z.number().int(),
});

export type FreeDesk = z.infer<typeof FreeDeskSchema>;

// What making invitations answers: the ones made, and who was left out for
// being a member already.
export const OrganizationInvitationCreatedSchema = z.object({
    invitations: z.array(OrganizationInvitationSchema),
    skippedEmails: z.array(z.string()),
});

export type OrganizationInvitationCreated = z.infer<
    typeof OrganizationInvitationCreatedSchema
>;

// What taking an invitation answers.
export type OrganizationInvitationAccepted = {
    organizationId: string;
};
