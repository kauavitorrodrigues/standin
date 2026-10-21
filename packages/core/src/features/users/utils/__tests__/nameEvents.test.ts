import { describe, expect, it, vi } from "vitest";
import { onUserNameChanged, publishUserNameChanged } from "../nameEvents";

describe("user name events", () => {
    it("tells the listeners in order and waits for each one", async () => {
        const seen: string[] = [];
        const stopFirst = onUserNameChanged(async () => {
            await Promise.resolve();
            seen.push("first");
        });
        const stopSecond = onUserNameChanged(() => {
            seen.push("second");
        });

        await publishUserNameChanged({ userId: "u1", name: "Ana" });

        expect(seen).toEqual(["first", "second"]);
        stopFirst();
        stopSecond();
    });

    it("stops telling a listener that was removed", async () => {
        const listener = vi.fn();
        const stop = onUserNameChanged(listener);
        stop();

        await publishUserNameChanged({ userId: "u1", name: "Ana" });

        expect(listener).not.toHaveBeenCalled();
    });

    it("logs a listener that throws and still tells the others", async () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        const next = vi.fn();
        const stopBroken = onUserNameChanged(() => {
            throw new Error("broken");
        });
        const stopNext = onUserNameChanged(next);

        await publishUserNameChanged({ userId: "u1", name: "Ana" });

        expect(error).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith({ userId: "u1", name: "Ana" });
        stopBroken();
        stopNext();
        error.mockRestore();
    });
});
