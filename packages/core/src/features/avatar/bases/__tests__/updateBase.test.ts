import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateBase } from "../updateBase";

const { findActiveBaseRow, unsetDefaultBase, regenerateForBase, loadBase } =
    vi.hoisted(() => ({
        findActiveBaseRow: vi.fn(),
        unsetDefaultBase: vi.fn(),
        regenerateForBase: vi.fn(),
        loadBase: vi.fn(),
    }));

vi.mock("../utils/findBaseRow", () => ({ findActiveBaseRow }));
vi.mock("../utils/unsetDefaultBase", () => ({ unsetDefaultBase }));
vi.mock("../utils/loadBase", () => ({ loadAvatarBase: loadBase }));
vi.mock("../../sheets/regenerateForBase", () => ({ regenerateForBase }));
vi.mock("@standin/database", () => ({
    avatarBasesTable: { id: "id" },
    eq: vi.fn(),
    db: {
        transaction: (run: (tx: unknown) => Promise<void>) =>
            run({
                update: () => ({ set: () => ({ where: () => undefined }) }),
            }),
    },
}));

describe("updateBase", () => {
    beforeEach(() => vi.clearAllMocks());

    it("takes the default flag from the previous default of the same kind", async () => {
        findActiveBaseRow.mockResolvedValue({ id: "m1", kind: "MANNEQUIN" });

        await updateBase("m1", { isDefault: true });

        expect(unsetDefaultBase).toHaveBeenCalledWith(
            expect.anything(),
            "MANNEQUIN"
        );
    });

    it("assembles the sheets again when a body becomes the default", async () => {
        findActiveBaseRow.mockResolvedValue({ id: "b1", kind: "BODY" });

        await updateBase("b1", { isDefault: true });

        expect(unsetDefaultBase).toHaveBeenCalledWith(
            expect.anything(),
            "BODY"
        );
        expect(regenerateForBase).toHaveBeenCalledWith("b1");
    });

    it("assembles nothing when a mannequin becomes the default", async () => {
        findActiveBaseRow.mockResolvedValue({ id: "m1", kind: "MANNEQUIN" });

        await updateBase("m1", { isDefault: true });

        expect(regenerateForBase).not.toHaveBeenCalled();
    });

    it("does not touch the default when only renaming", async () => {
        findActiveBaseRow.mockResolvedValue({ id: "b1", kind: "BODY" });

        await updateBase("b1", { name: "Renamed" });

        expect(unsetDefaultBase).not.toHaveBeenCalled();
        expect(regenerateForBase).not.toHaveBeenCalled();
    });
});
