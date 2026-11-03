import { organizationInvitesTable, and, eq, isNull } from "@standin/database";
import type { Transaction } from "@standin/database";
import {
    generateInviteToken,
    hashInviteToken,
} from "../../spaces/guests/invites/utils/generateToken";
import { readSealedToken, sealToken } from "../../../lib/crypto";
import { ORGANIZATION_INVITATION_TOKEN_PREFIX } from "@standin/contracts";
import { invitationSelect } from "./select";
import type { InvitationRow } from "./types";

type Target = {
    organizationId: string;
    createdBy: string;
    email: string;
    spaceId: string | null;
    mapAssetId: string | null;
    expiresAt: Date;
};

const newToken = () =>
    `${ORGANIZATION_INVITATION_TOKEN_PREFIX}${generateInviteToken()}`;

const sealedFields = (token: string) => ({
    tokenHash: hashInviteToken(token),
    tokenEncrypted: sealToken(token),
});

// The invitation of the e-mail, open or taken, locked so two sends wait.
const findForUpdate = async (
    tx: Transaction,
    organizationId: string,
    email: string
): Promise<InvitationRow | undefined> => {
    const [row] = await tx
        .select(invitationSelect)
        .from(organizationInvitesTable)
        .where(
            and(
                eq(organizationInvitesTable.organizationId, organizationId),
                eq(organizationInvitesTable.email, email),
                isNull(organizationInvitesTable.deletedAt)
            )
        )
        .for("update");
    return row;
};

// A renewal keeps the link the owner may have sent already, unless it was
// taken (a used link must not open again) or cannot be read any more.
const keepsToken = (row: InvitationRow): boolean =>
    row.acceptedAt === null && readSealedToken(row) !== null;

/**
 * Makes the invitation of an e-mail, or renews the one it has: new date, new
 * desk, and the same link when it can be kept. Asking twice never makes two.
 */
export const upsertInvitation = async (
    tx: Transaction,
    target: Target
): Promise<InvitationRow> => {
    const existing = await findForUpdate(
        tx,
        target.organizationId,
        target.email
    );

    if (!existing) {
        const [created] = await tx
            .insert(organizationInvitesTable)
            .values({ ...target, ...sealedFields(newToken()) })
            .returning(invitationSelect);
        return created;
    }

    const token = keepsToken(existing) ? {} : sealedFields(newToken());
    const [renewed] = await tx
        .update(organizationInvitesTable)
        .set({
            expiresAt: target.expiresAt,
            spaceId: target.spaceId,
            mapAssetId: target.mapAssetId,
            acceptedAt: null,
            ...token,
        })
        .where(eq(organizationInvitesTable.id, existing.id))
        .returning(invitationSelect);
    return renewed;
};
