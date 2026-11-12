import { describe, expect, it } from "vitest";
import {
    announcedAvailability,
    chooseStatus,
    isBusyStatus,
    resolveUserStatus,
} from "../userStatus";

describe("resolveUserStatus", () => {
    const none = { isBusy: false, isManualAway: false, isIdle: false };

    it("is active when nothing asks otherwise", () => {
        expect(resolveUserStatus(none)).toBe("active");
    });

    it("is away after inactivity and active again on activity", () => {
        expect(resolveUserStatus({ ...none, isIdle: true })).toBe("away");
        expect(resolveUserStatus({ ...none, isIdle: false })).toBe("active");
    });

    it("stays away after a manual choice, whatever the activity", () => {
        expect(resolveUserStatus({ ...none, isManualAway: true })).toBe("away");
        expect(
            resolveUserStatus({ ...none, isManualAway: true, isIdle: false })
        ).toBe("away");
        expect(
            resolveUserStatus({ ...none, isManualAway: true, isIdle: true })
        ).toBe("away");
    });

    it("is busy before anything else", () => {
        expect(resolveUserStatus({ ...none, isBusy: true })).toBe("busy");
        expect(
            resolveUserStatus({
                isBusy: true,
                isManualAway: true,
                isIdle: true,
            })
        ).toBe("busy");
    });
});

describe("chooseStatus", () => {
    it("keeps only away as a choice", () => {
        expect(chooseStatus("away")).toEqual({
            isBusy: false,
            isManualAway: true,
        });
        expect(chooseStatus("active")).toEqual({
            isBusy: false,
            isManualAway: false,
        });
    });

    it("replaces a manual away with busy", () => {
        expect(chooseStatus("busy")).toEqual({
            isBusy: true,
            isManualAway: false,
        });
    });

    it("returns to active when the person leaves busy", () => {
        const left = chooseStatus("active");

        expect(resolveUserStatus({ ...left, isIdle: false })).toBe("active");
    });
});

describe("user status helpers", () => {
    it("tells whether a status asks not to be disturbed", () => {
        expect(isBusyStatus("busy")).toBe(true);
        expect(isBusyStatus("away")).toBe(false);
        expect(isBusyStatus("active")).toBe(false);
    });

    it("never announces busy: the headphones carry it", () => {
        expect(announcedAvailability("away")).toBe("away");
        expect(announcedAvailability("active")).toBe("active");
        expect(announcedAvailability("busy")).toBe("active");
    });
});
