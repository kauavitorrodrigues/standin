import { describe, expect, it } from "vitest";
import { ORGANIZATION_MEMBER_ROLES } from "../../../../organizations/enums/organization-member-role";
import { canInviteGuests } from "../canInviteGuests";

describe("canInviteGuests", () => {
    it.each([true, false])(
        "always lets the owner invite (members can invite: %s)",
        (membersCanInvite) => {
            expect(
                canInviteGuests(
                    ORGANIZATION_MEMBER_ROLES.OWNER,
                    membersCanInvite
                )
            ).toBe(true);
        }
    );

    it("lets a member invite only when the space allows it", () => {
        expect(canInviteGuests(ORGANIZATION_MEMBER_ROLES.MEMBER, true)).toBe(
            true
        );
        expect(canInviteGuests(ORGANIZATION_MEMBER_ROLES.MEMBER, false)).toBe(
            false
        );
    });
});
