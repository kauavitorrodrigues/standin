import { describe, expect, it, vi } from "vitest";
import {
    onAvatarSheetChanged,
    publishAvatarSheetChanged,
} from "../sheetEvents";

describe("avatar sheet events", () => {
    it("tells the listeners in order and waits for each one", async () => {
        const seen: string[] = [];
        const stopFirst = onAvatarSheetChanged(async () => {
            await Promise.resolve();
            seen.push("first");
        });
        const stopSecond = onAvatarSheetChanged(() => {
            seen.push("second");
        });

        await publishAvatarSheetChanged({
            userId: "u1",
            avatarSheetFileId: "f1",
        });

        expect(seen).toEqual(["first", "second"]);
        stopFirst();
        stopSecond();
    });

    it("stops telling a listener that was removed", async () => {
        const listener = vi.fn();
        const stop = onAvatarSheetChanged(listener);
        stop();

        await publishAvatarSheetChanged({
            userId: "u1",
            avatarSheetFileId: null,
        });

        expect(listener).not.toHaveBeenCalled();
    });

    it("logs a listener that throws and still tells the others", async () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        const next = vi.fn();
        const stopBroken = onAvatarSheetChanged(() => {
            throw new Error("boom");
        });
        const stopNext = onAvatarSheetChanged(next);

        await publishAvatarSheetChanged({
            userId: "u1",
            avatarSheetFileId: "f1",
        });

        expect(next).toHaveBeenCalledWith({
            userId: "u1",
            avatarSheetFileId: "f1",
        });
        stopBroken();
        stopNext();
    });
});
