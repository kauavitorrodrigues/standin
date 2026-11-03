import { describe, expect, it } from "vitest";
import {
    SPACE_GUEST_LIST_STATES,
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
} from "@standin/contracts";
import { canBeArchived, toListState } from "../entry";

const now = new Date("2026-10-22T12:00:00Z");
const HOUR = 60 * 60 * 1000;
const at = (offsetMs: number) => new Date(now.getTime() + offsetMs);

const input = (
    status: keyof typeof SPACE_GUEST_STATUSES,
    statusReason: keyof typeof SPACE_GUEST_STATUS_REASONS,
    archivedAt: Date | null = null
) => ({
    status: SPACE_GUEST_STATUSES[status],
    statusReason: SPACE_GUEST_STATUS_REASONS[statusReason],
    archivedAt,
});

const life = (
    status: keyof typeof SPACE_GUEST_STATUSES,
    expiresAt: Date | null
) => ({
    status: SPACE_GUEST_STATUSES[status],
    expiresAt,
});

describe("toListState", () => {
    it("lets archived win over everything", () => {
        expect(
            toListState(input("ADMITTED", "HOST_ADMITTED", new Date()))
        ).toBe(SPACE_GUEST_LIST_STATES.ARCHIVED);
    });

    it("reads a pending request as pending", () => {
        expect(toListState(input("PENDING", "AWAITING_RESPONSE"))).toBe(
            SPACE_GUEST_LIST_STATES.PENDING
        );
    });

    it("reads an admitted guest as active", () => {
        expect(toListState(input("ADMITTED", "HOST_ADMITTED"))).toBe(
            SPACE_GUEST_LIST_STATES.ACTIVE
        );
    });

    it("reads a denied timeout as expired", () => {
        expect(toListState(input("DENIED", "TIMEOUT"))).toBe(
            SPACE_GUEST_LIST_STATES.EXPIRED
        );
    });

    it("reads a denial by a host as revoked", () => {
        expect(toListState(input("DENIED", "HOST_DENIED"))).toBe(
            SPACE_GUEST_LIST_STATES.REVOKED
        );
        expect(toListState(input("DENIED", "KICKED"))).toBe(
            SPACE_GUEST_LIST_STATES.REVOKED
        );
    });
});

describe("canBeArchived", () => {
    it("refuses a guest who is inside", () => {
        expect(canBeArchived(life("ADMITTED", at(HOUR)), now)).toBe(false);
        expect(canBeArchived(life("ADMITTED", null), now)).toBe(false);
    });

    it("refuses a request that is still waiting", () => {
        expect(canBeArchived(life("PENDING", at(HOUR)), now)).toBe(false);
    });

    it("allows a request past its time even before the sweeper ran", () => {
        expect(canBeArchived(life("PENDING", at(-HOUR)), now)).toBe(true);
    });

    it("allows a denied row", () => {
        expect(canBeArchived(life("DENIED", at(HOUR)), now)).toBe(true);
    });

    it("allows an admission that lapsed", () => {
        expect(canBeArchived(life("ADMITTED", at(-HOUR)), now)).toBe(true);
    });
});
