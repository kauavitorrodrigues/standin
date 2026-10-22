import { describe, expect, it } from "vitest";
import type { SpaceGuestState } from "@standin/contracts";
import { WAITING_POLL_MS, getGuestPollInterval } from "../getGuestPollInterval";

const state = (status: SpaceGuestState["status"]): SpaceGuestState => ({
    id: "g1",
    spaceId: "s1",
    status,
    statusReason: "AWAITING_RESPONSE",
    respondedAt: null,
    expiresAt: "2026-10-23T12:00:00.000Z",
});

describe("getGuestPollInterval", () => {
    it("polls a request that is waiting", () => {
        expect(getGuestPollInterval(state("PENDING"))).toBe(WAITING_POLL_MS);
    });

    it.each(["ADMITTED", "DENIED"] as const)(
        "stops polling once %s",
        (status) => {
            expect(getGuestPollInterval(state(status))).toBe(false);
        }
    );

    it("does not poll before the request is known, or when there is none", () => {
        expect(getGuestPollInterval(undefined)).toBe(false);
        expect(getGuestPollInterval(null)).toBe(false);
    });
});
