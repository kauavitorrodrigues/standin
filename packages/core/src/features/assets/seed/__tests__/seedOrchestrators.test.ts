import {
    AvatarSheetInvalidSizeError,
    LibrarySeedEntryError,
    LibrarySeedReferenceNotFoundError,
} from "@standin/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
    SeedArea,
    SeedAvatarBase,
    SeedAvatarPart,
    SeedBundle,
} from "../types";

const mocks = vi.hoisted(() => ({
    repo: {
        findAssetIdsByKeys: vi.fn(),
        findTilesetIdsByKeys: vi.fn(),
        findAreaByKey: vi.fn(),
        findBundleParts: vi.fn(),
        findAvatarBaseByKey: vi.fn(),
        findAvatarPartByKey: vi.fn(),
        findAvatarVariation: vi.fn(),
    },
    createArea: vi.fn(),
    replaceArea: vi.fn(),
    isSameStoredFile: vi.fn(),
    setAssetParts: vi.fn(),
    createBase: vi.fn(),
    replaceBaseSheet: vi.fn(),
    replaceBasePreview: vi.fn(),
    updateBase: vi.fn(),
    createPart: vi.fn(),
    createVariation: vi.fn(),
    updatePart: vi.fn(),
    isSameFileById: vi.fn(),
    isPreviewCurrent: vi.fn(),
    syncImages: vi.fn(),
    assertImagesValid: vi.fn(),
}));

vi.mock("../repository", () => ({ SeedRepository: mocks.repo }));
vi.mock("../../../areas/createArea", () => ({ createArea: mocks.createArea }));
vi.mock("../../../areas/replaceArea", () => ({
    replaceArea: mocks.replaceArea,
}));
vi.mock("../../library/utils/isSameStoredFile", () => ({
    isSameStoredFile: mocks.isSameStoredFile,
}));
vi.mock("../../assets/setAssetParts", () => ({
    setLibraryAssetParts: mocks.setAssetParts,
}));
vi.mock("../../../avatar/bases/createBase", () => ({
    createBase: mocks.createBase,
}));
vi.mock("../../../avatar/bases/replaceBaseSheet", () => ({
    replaceBaseSheet: mocks.replaceBaseSheet,
}));
vi.mock("../../../avatar/bases/replaceBasePreview", () => ({
    replaceBasePreview: mocks.replaceBasePreview,
}));
vi.mock("../../../avatar/bases/updateBase", () => ({
    updateBase: mocks.updateBase,
}));
vi.mock("../../../avatar/parts/createPart", () => ({
    createPart: mocks.createPart,
}));
vi.mock("../../../avatar/parts/createVariation", () => ({
    createVariation: mocks.createVariation,
}));
vi.mock("../../../avatar/parts/updatePart", () => ({
    updatePart: mocks.updatePart,
}));
vi.mock("../compare/isSameFileById", () => ({
    isSameFileById: mocks.isSameFileById,
}));
vi.mock("../compare/isPreviewCurrent", () => ({
    isPreviewCurrent: mocks.isPreviewCurrent,
}));
vi.mock("../run/syncImages", () => ({ syncImages: mocks.syncImages }));
vi.mock("../run/assertImagesValid", () => ({
    assertImagesValid: mocks.assertImagesValid,
}));

import { seedAreas } from "../seedAreas";
import { seedAvatarBases } from "../seedAvatarBases";
import { seedAvatarParts } from "../seedAvatarParts";
import { seedBundles } from "../seedBundles";

const context = { organizationId: null, createdBy: "admin-1" };
const png = Buffer.from("png");
const refusal = () => new AvatarSheetInvalidSizeError();
const failure = async (work: Promise<unknown>) =>
    work.then(
        () => null,
        (error) => error
    );

beforeEach(() => {
    vi.resetAllMocks();
    mocks.isSameStoredFile.mockResolvedValue(true);
    mocks.isSameFileById.mockResolvedValue(true);
    mocks.isPreviewCurrent.mockResolvedValue(true);
    mocks.syncImages.mockResolvedValue(false);
});

describe("seedAreas", () => {
    const area = (key: string, name = "Lobby"): SeedArea => ({
        key,
        name,
        image: png,
        stamp: {
            version: 1,
            width: 2,
            height: 2,
            palette: [{ tilesetKey: "floor", tileIndex: 0 }],
            layers: { ground: [1, 1, 1, 1] },
            objects: [],
            zone: null,
        },
    });
    const resolved = {
        version: 1,
        width: 2,
        height: 2,
        palette: [{ tilesetId: "t-1", tileIndex: 0 }],
        layers: { ground: [1, 1, 1, 1] },
        objects: [],
        zone: null,
    };
    const stored = { id: "a-1", name: "Lobby", stamp: resolved, fileName: "x" };

    beforeEach(() => {
        mocks.repo.findTilesetIdsByKeys.mockResolvedValue(
            new Map([["floor", "t-1"]])
        );
        mocks.repo.findAssetIdsByKeys.mockResolvedValue(new Map());
    });

    it("creates an area that is not there, with its key", async () => {
        mocks.repo.findAreaByKey.mockResolvedValue(null);
        mocks.createArea.mockResolvedValue({ id: "a-9" });

        const items = await seedAreas([area("lobby")], context);

        expect(items).toEqual([{ id: "a-9", key: "lobby", action: "create" }]);
        expect(mocks.createArea).toHaveBeenCalledWith(
            { buffer: png },
            { name: "Lobby", stamp: resolved },
            context,
            "lobby"
        );
    });

    it("leaves an equal area alone", async () => {
        mocks.repo.findAreaByKey.mockResolvedValue(stored);

        const items = await seedAreas([area("lobby")], context);

        expect(items[0]).toMatchObject({ id: "a-1", action: "unchanged" });
        expect(mocks.replaceArea).not.toHaveBeenCalled();
    });

    it("replaces an area whose name or image changed", async () => {
        mocks.repo.findAreaByKey.mockResolvedValue(stored);
        await seedAreas([area("lobby", "Lobby 2")], context);
        expect(mocks.replaceArea).toHaveBeenCalledTimes(1);

        mocks.isSameStoredFile.mockResolvedValue(false);
        const items = await seedAreas([area("lobby")], context);
        expect(items[0]!.action).toBe("update");
        expect(mocks.replaceArea).toHaveBeenCalledWith(
            "a-1",
            null,
            { buffer: png },
            { name: "Lobby", stamp: resolved }
        );
    });

    it("fails on an unknown key before anything is written", async () => {
        mocks.repo.findTilesetIdsByKeys.mockResolvedValue(new Map());

        const error = await failure(seedAreas([area("lobby")], context));

        expect(error).toBeInstanceOf(LibrarySeedReferenceNotFoundError);
        expect(mocks.createArea).not.toHaveBeenCalled();
        expect(mocks.repo.findAreaByKey).not.toHaveBeenCalled();
    });

    it("stops at the first failing entry and names it", async () => {
        mocks.repo.findAreaByKey.mockResolvedValue(null);
        mocks.createArea.mockRejectedValueOnce(refusal());

        const error = await failure(
            seedAreas([area("one"), area("two"), area("three")], context)
        );

        expect(error).toBeInstanceOf(LibrarySeedEntryError);
        expect(error.message).toContain('areas "one"');
        expect(mocks.createArea).toHaveBeenCalledTimes(1);
        expect(mocks.repo.findAreaByKey).toHaveBeenCalledTimes(1);
    });
});

describe("seedBundles", () => {
    const bundle = (asset: string, offsetY = 1): SeedBundle => ({
        asset,
        parts: [{ partAsset: "chair", offsetX: 0, offsetY }],
    });
    const ids = new Map([
        ["table", "a-table"],
        ["desk", "a-desk"],
        ["chair", "a-chair"],
    ]);
    const row = (offsetY: number) => ({
        partAssetId: "a-chair",
        offsetX: 0,
        offsetY,
    });

    beforeEach(() => mocks.repo.findAssetIdsByKeys.mockResolvedValue(ids));

    it("creates the parts of a bundle that had none", async () => {
        mocks.repo.findBundleParts.mockResolvedValue([]);

        const items = await seedBundles([bundle("table")]);

        expect(items).toEqual([
            { id: "a-table", key: "table", action: "create" },
        ]);
        expect(mocks.setAssetParts).toHaveBeenCalledWith("a-table", null, {
            parts: [row(1)],
        });
    });

    it("does not write when the parts match", async () => {
        mocks.repo.findBundleParts.mockResolvedValue([row(1)]);

        const items = await seedBundles([bundle("table")]);

        expect(items[0]!.action).toBe("unchanged");
        expect(mocks.setAssetParts).not.toHaveBeenCalled();
    });

    it("updates a bundle whose parts differ", async () => {
        mocks.repo.findBundleParts.mockResolvedValue([row(5)]);

        const items = await seedBundles([bundle("table")]);

        expect(items[0]!.action).toBe("update");
        expect(mocks.setAssetParts).toHaveBeenCalledTimes(1);
    });

    it("lists every unknown key and writes nothing for the entry", async () => {
        const error = await failure(
            seedBundles([
                {
                    asset: "ghost",
                    parts: [{ partAsset: "phantom", offsetX: 0, offsetY: 0 }],
                },
            ])
        );

        expect(error).toBeInstanceOf(LibrarySeedReferenceNotFoundError);
        expect(error.references).toHaveLength(2);
        expect(error.entry).toBe('bundles[0] "ghost"');
        expect(mocks.setAssetParts).not.toHaveBeenCalled();
    });

    it("stops at the first failing entry", async () => {
        mocks.repo.findBundleParts.mockResolvedValue([]);
        mocks.setAssetParts.mockRejectedValueOnce(refusal());

        const error = await failure(
            seedBundles([bundle("table"), bundle("desk")])
        );

        expect(error).toBeInstanceOf(LibrarySeedEntryError);
        expect(mocks.setAssetParts).toHaveBeenCalledTimes(1);
        expect(mocks.repo.findBundleParts).toHaveBeenCalledTimes(1);
    });
});

describe("seedAvatarBases", () => {
    const entry = (key: string, extra: Partial<SeedAvatarBase> = {}) =>
        ({ key, name: "Body", image: png, ...extra }) as SeedAvatarBase;
    const stored = {
        id: "b-1",
        name: "Body",
        kind: "BODY",
        isDefault: false,
        fileId: "f-1",
        previewFileId: "f-2",
    };

    it("creates a base with the defaults the entry leaves out", async () => {
        mocks.repo.findAvatarBaseByKey.mockResolvedValue(null);
        mocks.createBase.mockResolvedValue({ base: { id: "b-9" } });

        const items = await seedAvatarBases([entry("body")], context);

        expect(items).toEqual([{ id: "b-9", key: "body", action: "create" }]);
        expect(mocks.createBase).toHaveBeenCalledWith(
            { buffer: png },
            undefined,
            { key: "body", name: "Body", kind: "BODY", isDefault: false },
            { createdBy: "admin-1" }
        );
    });

    it("leaves an equal base alone", async () => {
        mocks.repo.findAvatarBaseByKey.mockResolvedValue(stored);

        const items = await seedAvatarBases([entry("body")], context);

        expect(items[0]!.action).toBe("unchanged");
        expect(mocks.updateBase).not.toHaveBeenCalled();
        expect(mocks.replaceBaseSheet).not.toHaveBeenCalled();
    });

    it("updates the name and the default flag", async () => {
        mocks.repo.findAvatarBaseByKey.mockResolvedValue(stored);

        const items = await seedAvatarBases(
            [entry("body", { name: "Body 2", isDefault: true })],
            context
        );

        expect(items[0]!.action).toBe("update");
        expect(mocks.updateBase).toHaveBeenCalledWith("b-1", {
            name: "Body 2",
            isDefault: true,
        });
    });

    it("swaps the images before it touches the fields", async () => {
        mocks.repo.findAvatarBaseByKey.mockResolvedValue(stored);
        mocks.isSameFileById.mockResolvedValue(false);
        mocks.isPreviewCurrent.mockResolvedValue(false);
        const order: string[] = [];
        mocks.assertImagesValid.mockImplementation(() => order.push("check"));
        mocks.replaceBaseSheet.mockImplementation(async () =>
            order.push("sheet")
        );
        mocks.replaceBasePreview.mockImplementation(async () =>
            order.push("preview")
        );
        mocks.updateBase.mockImplementation(async () => order.push("fields"));

        await seedAvatarBases(
            [entry("body", { name: "Body 2", preview: png })],
            context
        );

        expect(order).toEqual(["check", "sheet", "preview", "fields"]);
    });

    it("writes nothing when an image is refused", async () => {
        mocks.repo.findAvatarBaseByKey.mockResolvedValue(stored);
        mocks.isSameFileById.mockResolvedValue(false);
        mocks.assertImagesValid.mockImplementation(() => {
            throw refusal();
        });

        const error = await failure(
            seedAvatarBases([entry("body", { name: "Body 2" })], context)
        );

        expect(error).toBeInstanceOf(LibrarySeedEntryError);
        expect(mocks.replaceBaseSheet).not.toHaveBeenCalled();
        expect(mocks.updateBase).not.toHaveBeenCalled();
    });

    it("refuses to change the kind", async () => {
        mocks.repo.findAvatarBaseByKey.mockResolvedValue(stored);

        const error = await failure(
            seedAvatarBases([entry("body", { kind: "MANNEQUIN" })], context)
        );

        expect(error).toBeInstanceOf(LibrarySeedEntryError);
        expect(error.code).toBe("LIBRARY_SEED_AVATAR_KIND_CHANGED");
        expect(mocks.updateBase).not.toHaveBeenCalled();
    });

    it("stops at the first failing entry", async () => {
        mocks.repo.findAvatarBaseByKey.mockResolvedValue(null);
        mocks.createBase.mockRejectedValueOnce(refusal());

        const error = await failure(
            seedAvatarBases([entry("one"), entry("two")], context)
        );

        expect(error.message).toContain('avatarBases "one"');
        expect(mocks.createBase).toHaveBeenCalledTimes(1);
        expect(mocks.repo.findAvatarBaseByKey).toHaveBeenCalledTimes(1);
    });
});

describe("seedAvatarParts", () => {
    const part = (key: string, extra: Partial<SeedAvatarPart> = {}) =>
        ({
            key,
            name: "Hair",
            slot: "HAIR",
            colorKey: "black",
            colorHex: "#1A1A1A",
            image: png,
            preview: png,
            ...extra,
        }) as SeedAvatarPart;
    const red = {
        colorKey: "red",
        colorHex: "#B03A2E",
        image: png,
        preview: png,
    };
    const stored = {
        id: "p-1",
        key: "hair",
        name: "Hair",
        slot: "HAIR",
        basePartId: null,
        colorKey: "black",
        colorHex: "#1A1A1A",
        fileId: "f-1",
        previewFileId: "f-2",
    };
    const storedRed = {
        ...stored,
        id: "p-2",
        key: "hair-red",
        basePartId: "p-1",
        colorKey: "red",
        colorHex: "#B03A2E",
    };

    it("creates a part and then its variations from the family answer", async () => {
        mocks.repo.findAvatarPartByKey.mockResolvedValue(null);
        mocks.createPart.mockResolvedValue({ part: { id: "p-9" } });
        mocks.repo.findAvatarVariation.mockResolvedValue(null);
        mocks.createVariation.mockResolvedValue({
            part: {
                variations: [
                    {
                        id: "p-9",
                        key: "hair",
                        basePartId: null,
                        colorKey: "black",
                    },
                    {
                        id: "p-10",
                        key: "hair-red",
                        basePartId: "p-9",
                        colorKey: "red",
                    },
                ],
            },
        });

        const items = await seedAvatarParts(
            [part("hair", { variations: [red] })],
            context
        );

        expect(items).toEqual([
            { id: "p-9", key: "hair", action: "create" },
            { id: "p-10", key: "hair-red", action: "create" },
        ]);
        expect(mocks.createVariation).toHaveBeenCalledWith(
            "p-9",
            { buffer: png },
            { buffer: png },
            { colorKey: "red", colorHex: "#B03A2E" },
            { createdBy: "admin-1" }
        );
        expect(mocks.repo.findAvatarVariation).toHaveBeenCalledTimes(1);
    });

    it("fails with its own error when the family lacks the new color", async () => {
        mocks.repo.findAvatarPartByKey.mockResolvedValue(stored);
        mocks.repo.findAvatarVariation.mockResolvedValue(null);
        mocks.createVariation.mockResolvedValue({ part: { variations: [] } });

        const error = await failure(
            seedAvatarParts([part("hair", { variations: [red] })], context)
        );

        expect(error).toBeInstanceOf(LibrarySeedEntryError);
        expect(error.code).toBe("LIBRARY_SEED_AVATAR_VARIATION_MISSING");
    });

    it("leaves an equal part and variation alone", async () => {
        mocks.repo.findAvatarPartByKey.mockResolvedValue(stored);
        mocks.repo.findAvatarVariation.mockResolvedValue(storedRed);

        const items = await seedAvatarParts(
            [part("hair", { variations: [red] })],
            context
        );

        expect(items.map(({ action }) => action)).toEqual([
            "unchanged",
            "unchanged",
        ]);
        expect(mocks.updatePart).not.toHaveBeenCalled();
    });

    it("updates a name, an image and a variation color", async () => {
        mocks.repo.findAvatarPartByKey.mockResolvedValue(stored);
        mocks.repo.findAvatarVariation.mockResolvedValue(storedRed);
        mocks.syncImages.mockResolvedValueOnce(true);

        const items = await seedAvatarParts(
            [
                part("hair", {
                    name: "Long hair",
                    variations: [{ ...red, colorHex: "#C03A2E" }],
                }),
            ],
            context
        );

        expect(items.map(({ action }) => action)).toEqual(["update", "update"]);
        expect(mocks.updatePart).toHaveBeenNthCalledWith(1, "p-1", {
            name: "Long hair",
        });
        expect(mocks.updatePart).toHaveBeenNthCalledWith(2, "p-2", {
            colorKey: "red",
            colorHex: "#C03A2E",
        });
    });

    it("replaces the images before it renames the part", async () => {
        mocks.repo.findAvatarPartByKey.mockResolvedValue(stored);
        const order: string[] = [];
        mocks.syncImages.mockImplementation(async () => {
            order.push("images");
            return true;
        });
        mocks.updatePart.mockImplementation(async () => order.push("fields"));

        await seedAvatarParts([part("hair", { name: "Long hair" })], context);

        expect(order).toEqual(["images", "fields"]);
    });

    it("renames nothing when the images are refused", async () => {
        mocks.repo.findAvatarPartByKey.mockResolvedValue(stored);
        mocks.syncImages.mockRejectedValue(refusal());

        const error = await failure(
            seedAvatarParts([part("hair", { name: "Long hair" })], context)
        );

        expect(error).toBeInstanceOf(LibrarySeedEntryError);
        expect(mocks.updatePart).not.toHaveBeenCalled();
    });

    it("refuses a moved slot and a key that is a variation", async () => {
        mocks.repo.findAvatarPartByKey.mockResolvedValue(stored);
        const moved = await failure(
            seedAvatarParts([part("hair", { slot: "HAT" })], context)
        );
        expect(moved.code).toBe("LIBRARY_SEED_AVATAR_SLOT_CHANGED");

        mocks.repo.findAvatarPartByKey.mockResolvedValue(storedRed);
        const kind = await failure(seedAvatarParts([part("hair")], context));
        expect(kind.code).toBe("LIBRARY_SEED_AVATAR_PART_KIND");
        expect(mocks.syncImages).not.toHaveBeenCalled();
    });

    it("stops at the first failing part", async () => {
        mocks.repo.findAvatarPartByKey.mockResolvedValue(null);
        mocks.createPart.mockRejectedValueOnce(refusal());

        const error = await failure(
            seedAvatarParts([part("one"), part("two")], context)
        );

        expect(error.message).toContain('avatarParts "one"');
        expect(mocks.createPart).toHaveBeenCalledTimes(1);
        expect(mocks.repo.findAvatarPartByKey).toHaveBeenCalledTimes(1);
    });
});
