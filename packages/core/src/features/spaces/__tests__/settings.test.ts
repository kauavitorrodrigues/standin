import { beforeEach, describe, expect, it, vi } from "vitest";

const { selectMock, returningMock, setMock } = vi.hoisted(() => ({
    selectMock: vi.fn(),
    returningMock: vi.fn(),
    setMock: vi.fn(),
}));

vi.mock("@standin/database", () => ({
    spacesTable: { enableSendNearbyInMapView: {}, proximityPreset: {} },
    and: vi.fn(),
    eq: vi.fn(),
    isNull: vi.fn(),
    sql: vi.fn(),
    db: {
        select: () => ({ from: () => ({ where: selectMock }) }),
        update: () => ({
            set: (values: unknown) => {
                setMock(values);
                return { where: () => ({ returning: returningMock }) };
            },
        }),
    },
}));

import { SpaceNotFoundError } from "@standin/contracts";
import { getSpaceSettings } from "../getSettings";
import { updateSpaceSettings } from "../updateSettings";

describe("getSpaceSettings", () => {
    beforeEach(() => vi.clearAllMocks());

    it("fills the default of a row that lacks a column", async () => {
        selectMock.mockResolvedValue([{}]);

        await expect(getSpaceSettings("org-1", "s1")).resolves.toEqual({
            enableSendNearbyInMapView: true,
            proximityPreset: "Long",
        });
    });

    it("returns the saved value", async () => {
        selectMock.mockResolvedValue([{ enableSendNearbyInMapView: false }]);

        await expect(getSpaceSettings("org-1", "s1")).resolves.toEqual({
            enableSendNearbyInMapView: false,
            proximityPreset: "Long",
        });
    });

    it("throws when the space does not exist", async () => {
        selectMock.mockResolvedValue([]);

        await expect(getSpaceSettings("org-1", "s1")).rejects.toBeInstanceOf(
            SpaceNotFoundError
        );
    });
});

describe("updateSpaceSettings", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns the settings the row holds after the merge", async () => {
        returningMock.mockResolvedValue([{ enableSendNearbyInMapView: false }]);

        await expect(
            updateSpaceSettings("org-1", "s1", {
                enableSendNearbyInMapView: false,
            })
        ).resolves.toEqual({
            enableSendNearbyInMapView: false,
            proximityPreset: "Long",
        });
        expect(setMock).toHaveBeenCalledWith({
            enableSendNearbyInMapView: false,
        });
    });

    it("reads instead of updating when nothing was sent", async () => {
        selectMock.mockResolvedValue([{ enableSendNearbyInMapView: true }]);

        await expect(
            updateSpaceSettings("org-1", "s1", {})
        ).resolves.toEqual({
            enableSendNearbyInMapView: true,
            proximityPreset: "Long",
        });
        expect(setMock).not.toHaveBeenCalled();
    });

    it("throws when the space does not exist", async () => {
        returningMock.mockResolvedValue([]);

        await expect(
            updateSpaceSettings("org-1", "s1", {
                enableSendNearbyInMapView: true,
            })
        ).rejects.toBeInstanceOf(SpaceNotFoundError);
    });
});
