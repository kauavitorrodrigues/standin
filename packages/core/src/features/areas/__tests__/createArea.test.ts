import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    values: vi.fn(),
    findScopedArea: vi.fn(),
}));

vi.mock("@standin/database", () => ({ areasTable: {} }));
vi.mock("../../assets/utils/withStoredFile", () => ({
    withStoredFile: (
        _image: unknown,
        work: (tx: unknown, fileId: string) => Promise<string>
    ) =>
        work(
            {
                insert: () => ({
                    values: (row: unknown) => {
                        mocks.values(row);
                        return { returning: async () => [{ id: "a-1" }] };
                    },
                }),
            },
            "file-1"
        ),
}));
vi.mock("../utils/validateAreaUpload", () => ({
    validateAreaUpload: async () => ({
        name: "Lobby",
        stamp: { width: 2, height: 2, objects: [] },
    }),
}));
vi.mock("../utils/findArea", () => ({
    findScopedArea: mocks.findScopedArea,
}));
vi.mock("../utils/toAreaSummary", () => ({
    toAreaDetail: (row: unknown) => row,
}));

import { createArea } from "../createArea";

const image = { buffer: Buffer.from("png") };
const data = { name: "Lobby", stamp: {} };
const context = { organizationId: null, createdBy: "u-1" };

beforeEach(() => vi.clearAllMocks());

describe("createArea key", () => {
    it("stores null when no key is given", async () => {
        await createArea(image, data, context);

        expect(mocks.values).toHaveBeenCalledWith(
            expect.objectContaining({ key: null, organizationId: null })
        );
    });

    it("stores the key the library seed sends", async () => {
        await createArea(image, data, context, "lobby");

        expect(mocks.values).toHaveBeenCalledWith(
            expect.objectContaining({ key: "lobby" })
        );
    });
});
