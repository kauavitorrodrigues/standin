import { beforeEach, describe, expect, it, vi } from "vitest";

const { findByIdMock, mapMock, conversationMock } = vi.hoisted(() => ({
    findByIdMock: vi.fn(),
    mapMock: vi.fn(),
    conversationMock: vi.fn(),
}));

vi.mock("../findById", () => ({ findSpaceById: findByIdMock }));
vi.mock("../../maps", () => ({ MapService: { findResolvedById: mapMock } }));
vi.mock("../../conversations", () => ({
    ConversationService: { findBySpaceId: conversationMock },
}));

import { findSpaceDetailsById } from "../findDetailsById";

beforeEach(() => {
    vi.resetAllMocks();
    mapMock.mockResolvedValue({ id: "map-1" });
    conversationMock.mockResolvedValue({ id: "c1" });
});

describe("findSpaceDetailsById", () => {
    it("carries the url of the thumbnail", async () => {
        findByIdMock.mockResolvedValue({
            id: "s1",
            name: "Lobby",
            mapId: "map-1",
            thumbnailUrl: "https://cdn/spaces/s1/photo.png",
        });

        const details = await findSpaceDetailsById("org-1", "s1");

        expect(details.thumbnailUrl).toBe("https://cdn/spaces/s1/photo.png");
    });

    it("carries null for a space that has none, so the editor can make one", async () => {
        findByIdMock.mockResolvedValue({
            id: "s1",
            name: "Lobby",
            mapId: "map-1",
            thumbnailUrl: null,
        });

        const details = await findSpaceDetailsById("org-1", "s1");

        expect(details.thumbnailUrl).toBeNull();
    });
});
