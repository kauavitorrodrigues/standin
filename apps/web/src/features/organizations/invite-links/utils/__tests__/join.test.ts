import { describe, expect, it } from "vitest";
import type { OrganizationInvitePreview, User } from "@standin/contracts";
import { INVITE_ERROR_MESSAGES } from "../../consts/messages";
import {
    getAcceptErrorMessage,
    getInviteErrorMessage,
    getJoinView,
} from "../join";

const base: OrganizationInvitePreview = {
    organizationName: "Acme",
    inviterName: "Ana",
    role: "MEMBER",
    email: null,
} as OrganizationInvitePreview;
const user = { id: "u1", email: "a@b.com" } as User;

describe("getJoinView", () => {
    it("waits while loading", () => {
        expect(
            getJoinView({ isLoading: true, invite: undefined, user: null })
        ).toBe("loading");
    });

    it("shows an error without a preview", () => {
        expect(
            getJoinView({ isLoading: false, invite: undefined, user: null })
        ).toBe("error");
    });

    it("keeps the link flow when there is no e-mail", () => {
        expect(
            getJoinView({ isLoading: false, invite: base, user: null })
        ).toBe("link");
    });

    it("asks to sign up an invited e-mail without a session", () => {
        const invite = { ...base, email: "a@b.com" };
        expect(getJoinView({ isLoading: false, invite, user: null })).toBe(
            "invitedSignUp"
        );
    });

    it("offers to accept with a session", () => {
        const invite = { ...base, email: "a@b.com" };
        expect(getJoinView({ isLoading: false, invite, user })).toBe("accept");
    });
});

describe("invite error messages", () => {
    it("names the invited e-mail on a mismatch", () => {
        const message = getInviteErrorMessage({
            code: "ORGANIZATION_INVITATION_EMAIL_MISMATCH",
            invitedEmail: "x@y.com",
        });
        expect(message).toContain("x@y.com");
    });

    it("maps expired and not found", () => {
        expect(
            getInviteErrorMessage({ code: "ORGANIZATION_INVITATION_EXPIRED" })
        ).toBe(INVITE_ERROR_MESSAGES.ORGANIZATION_INVITATION_EXPIRED);
        expect(
            getInviteErrorMessage({ code: "ORGANIZATION_INVITATION_NOT_FOUND" })
        ).toBe(INVITE_ERROR_MESSAGES.ORGANIZATION_INVITATION_NOT_FOUND);
    });

    it("falls back on an unknown code", () => {
        expect(getInviteErrorMessage({ code: "FALLBACK" })).toBe(
            INVITE_ERROR_MESSAGES.FALLBACK
        );
        expect(getInviteErrorMessage({ code: null })).toBe(
            INVITE_ERROR_MESSAGES.FALLBACK
        );
        expect(getAcceptErrorMessage({ code: "nope" })).not.toBe(
            INVITE_ERROR_MESSAGES.FALLBACK
        );
    });
});
