import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SpaceMedia } from "@standin/media";

const { markMovedMock } = vi.hoisted(() => ({ markMovedMock: vi.fn() }));

vi.mock("../MediaRuntime", () => ({
    mediaDirty: { markMoved: markMovedMock },
}));

import {
    forgetSpeakerChanges,
    syncSpeakerChanges,
} from "../syncSpeakerChanges";

const roomWith = (speakers: string[], ambientRange = "short") =>
    ({
        speakers: () => speakers,
        getAmbientRange: () => ambientRange,
    }) as unknown as SpaceMedia;

describe("syncSpeakerChanges", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Leaves no speaker behind for the next test.
        syncSpeakerChanges("space-1", roomWith([]));
        vi.clearAllMocks();
    });

    it("marks a person who started speaking", () => {
        syncSpeakerChanges("space-1", roomWith(["a"]));

        expect(markMovedMock).toHaveBeenCalledWith("space-1", "a");
    });

    it("marks a person who stopped speaking and only then", () => {
        syncSpeakerChanges("space-1", roomWith(["a", "b"]));
        markMovedMock.mockClear();

        syncSpeakerChanges("space-1", roomWith(["a"]));

        expect(markMovedMock).toHaveBeenCalledTimes(1);
        expect(markMovedMock).toHaveBeenCalledWith("space-1", "b");
    });

    it("marks nobody when the speakers did not change", () => {
        syncSpeakerChanges("space-1", roomWith(["a"]));
        markMovedMock.mockClear();

        syncSpeakerChanges("space-1", roomWith(["a"]));

        expect(markMovedMock).not.toHaveBeenCalled();
    });

    it("marks nobody while the ambient range is off", () => {
        syncSpeakerChanges("space-1", roomWith(["a"], "off"));

        expect(markMovedMock).not.toHaveBeenCalled();
    });

    it("forgets the speakers of a space, so they are marked again", () => {
        syncSpeakerChanges("space-1", roomWith(["a"]));
        forgetSpeakerChanges("space-1");
        markMovedMock.mockClear();

        syncSpeakerChanges("space-1", roomWith(["a"]));

        expect(markMovedMock).toHaveBeenCalledWith("space-1", "a");
    });
});
