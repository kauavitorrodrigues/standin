import { describe, expect, it, vi } from "vitest";

const { deleteMock } = vi.hoisted(() => ({ deleteMock: vi.fn() }));

vi.mock("@standin/infra", () => ({ StorageProvider: { delete: deleteMock } }));

import { purgeStorageKeys } from "../purgeStorageKeys";

describe("purgeStorageKeys", () => {
    it("removes every object", async () => {
        deleteMock.mockResolvedValue(undefined);

        await purgeStorageKeys(["a", "b"]);

        expect(deleteMock).toHaveBeenCalledWith("a");
        expect(deleteMock).toHaveBeenCalledWith("b");
    });

    it("logs a failure, never throws, and still removes the others", async () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        deleteMock.mockRejectedValueOnce(new Error("storage down"));
        deleteMock.mockResolvedValueOnce(undefined);

        await expect(purgeStorageKeys(["a", "b"])).resolves.toBeUndefined();

        expect(error).toHaveBeenCalledTimes(1);
        expect(deleteMock).toHaveBeenCalledTimes(2);
        error.mockRestore();
    });
});
