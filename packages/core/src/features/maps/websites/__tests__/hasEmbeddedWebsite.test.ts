import { beforeEach, describe, expect, it, vi } from "vitest";
import { SpaceNotFoundError } from "@standin/contracts";

const { refMock, paramsMock } = vi.hoisted(() => ({
    refMock: vi.fn(),
    paramsMock: vi.fn(),
}));

vi.mock("../../../spaces", () => ({
    SpaceService: { findRefById: refMock },
}));
vi.mock("../repository/findPlacedWebsiteParams", () => ({
    findPlacedWebsiteParams: paramsMock,
}));

import { hasEmbeddedWebsite } from "../hasEmbeddedWebsite";

describe("hasEmbeddedWebsite", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        refMock.mockResolvedValue({ mapId: "map-1" });
    });

    it("looks for the object on the map of the space", async () => {
        paramsMock.mockResolvedValue({
            behaviorParams: { mode: "url", url: "https://example.com" },
        });

        await expect(hasEmbeddedWebsite("space-1", "object-1")).resolves.toBe(
            true
        );
        expect(paramsMock).toHaveBeenCalledWith("map-1", "object-1");
    });

    it("refuses an object the map does not have", async () => {
        paramsMock.mockResolvedValue(undefined);

        await expect(hasEmbeddedWebsite("space-1", "object-1")).resolves.toBe(
            false
        );
    });

    it("refuses an object without the params of a website", async () => {
        paramsMock.mockResolvedValue({ behaviorParams: null });

        await expect(hasEmbeddedWebsite("space-1", "object-1")).resolves.toBe(
            false
        );
    });

    it("refuses when the space is gone", async () => {
        refMock.mockRejectedValue(new SpaceNotFoundError());

        await expect(hasEmbeddedWebsite("space-1", "object-1")).resolves.toBe(
            false
        );
        expect(paramsMock).not.toHaveBeenCalled();
    });
});
