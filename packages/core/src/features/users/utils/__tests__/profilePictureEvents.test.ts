import { describe, expect, it, vi } from "vitest";
import {
    onUserProfilePictureChanged,
    publishUserProfilePictureChanged,
} from "../profilePictureEvents";

describe("user profile picture events", () => {
    it("tells the listeners in order and waits for each one", async () => {
        const seen: string[] = [];
        const stopFirst = onUserProfilePictureChanged(async () => {
            await Promise.resolve();
            seen.push("first");
        });
        const stopSecond = onUserProfilePictureChanged(() => {
            seen.push("second");
        });

        await publishUserProfilePictureChanged({
            userId: "u1",
            profilePictureUrl: "/files/f1",
        });

        expect(seen).toEqual(["first", "second"]);
        stopFirst();
        stopSecond();
    });

    it("stops telling a listener that was removed", async () => {
        const listener = vi.fn();
        const stop = onUserProfilePictureChanged(listener);
        stop();

        await publishUserProfilePictureChanged({
            userId: "u1",
            profilePictureUrl: "/files/f1",
        });

        expect(listener).not.toHaveBeenCalled();
    });

    it("logs a listener that throws and still tells the others", async () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        const next = vi.fn();
        const stopBroken = onUserProfilePictureChanged(() => {
            throw new Error("broken");
        });
        const stopNext = onUserProfilePictureChanged(next);

        await publishUserProfilePictureChanged({
            userId: "u1",
            profilePictureUrl: "/files/f1",
        });

        expect(error).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith({
            userId: "u1",
            profilePictureUrl: "/files/f1",
        });
        stopBroken();
        stopNext();
        error.mockRestore();
    });
});
