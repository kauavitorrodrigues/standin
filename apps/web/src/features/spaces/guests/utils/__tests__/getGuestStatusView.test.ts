import { describe, expect, it } from "vitest";
import type { SpaceGuestState } from "@standin/contracts";
import { GUEST_STATUS_VIEWS, getGuestStatusView } from "../getGuestStatusView";

const state = (
    status: SpaceGuestState["status"],
    statusReason: SpaceGuestState["statusReason"]
): SpaceGuestState => ({
    id: "g1",
    spaceId: "s1",
    status,
    statusReason,
    respondedAt: null,
    expiresAt: "2026-10-23T12:00:00.000Z",
});

describe("getGuestStatusView", () => {
    it.each([
        ["PENDING", "AWAITING_RESPONSE", GUEST_STATUS_VIEWS.WAITING],
        ["ADMITTED", "HOST_ADMITTED", GUEST_STATUS_VIEWS.ADMITTED],
        ["DENIED", "HOST_DENIED", GUEST_STATUS_VIEWS.DENIED],
        ["DENIED", "KICKED", GUEST_STATUS_VIEWS.KICKED],
        ["DENIED", "TIMEOUT", GUEST_STATUS_VIEWS.EXPIRED],
        ["DENIED", "GUEST_ACCESS_DISABLED", GUEST_STATUS_VIEWS.DISABLED],
    ] as const)("%s with %s shows %s", (status, reason, expected) => {
        expect(getGuestStatusView(state(status, reason))).toBe(expected);
    });
});
