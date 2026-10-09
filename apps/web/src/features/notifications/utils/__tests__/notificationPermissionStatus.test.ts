import { describe, expect, it } from "vitest";
import {
    areNotificationsEnabled,
    canChangeNotifications,
} from "../notificationPermissionStatus";

describe("areNotificationsEnabled", () => {
    it("needs the permission and the person's choice", () => {
        expect(areNotificationsEnabled("granted", true)).toBe(true);
        expect(areNotificationsEnabled("granted", false)).toBe(false);
    });

    it("is off without the permission, whatever the choice", () => {
        expect(areNotificationsEnabled("default", true)).toBe(false);
        expect(areNotificationsEnabled("denied", true)).toBe(false);
        expect(areNotificationsEnabled("unsupported", true)).toBe(false);
    });
});

describe("canChangeNotifications", () => {
    it("is false once blocked or unsupported", () => {
        expect(canChangeNotifications("denied")).toBe(false);
        expect(canChangeNotifications("unsupported")).toBe(false);
    });

    it("is true while the permission can still be granted or kept", () => {
        expect(canChangeNotifications("default")).toBe(true);
        expect(canChangeNotifications("granted")).toBe(true);
    });
});
