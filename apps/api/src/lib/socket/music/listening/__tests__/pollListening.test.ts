import { beforeEach, describe, expect, it, vi } from "vitest";
import { SpotifyRateLimitedError } from "@standin/contracts";
import type { ListeningTrack } from "@standin/contracts";

const mocks = vi.hoisted(() => ({
    emitToRoom: vi.fn(),
    readPlayback: vi.fn(),
    listConnectedUserIds: vi.fn(),
    listSpaceIds: vi.fn(),
    listUserIds: vi.fn(),
    resolveOrganizationId: vi.fn(),
}));

vi.mock("../../../socketManager", () => ({
    SocketManager: { emitToRoom: mocks.emitToRoom },
}));
vi.mock("@standin/core", () => ({
    SpotifyService: {
        readPlayback: mocks.readPlayback,
        listConnectedUserIds: mocks.listConnectedUserIds,
    },
}));
vi.mock("../../../presence/PresenceStore", () => ({
    PresenceStore: {
        listSpaceIds: mocks.listSpaceIds,
        listUserIds: mocks.listUserIds,
    },
}));
vi.mock("../../../services/resolveSpaceOrganizationId", () => ({
    resolveSpaceOrganizationId: mocks.resolveOrganizationId,
}));

import { ListeningBackoff } from "../Backoff";
import { ListeningSync } from "../ListeningSync";
import { pollListening } from "../pollListening";

const track = (patch: Partial<ListeningTrack> = {}): ListeningTrack => ({
    trackId: "t1",
    title: "ALEXA 2",
    artists: ["LH CHUCRO"],
    coverUrl: null,
    url: "https://open.spotify.com/track/t1",
    isPlaying: true,
    ...patch,
});

beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    ListeningSync.clear();
    ListeningBackoff.clear();
    mocks.listSpaceIds.mockReturnValue(["s1"]);
    mocks.listUserIds.mockReturnValue(["u1", "u2"]);
    mocks.resolveOrganizationId.mockResolvedValue("org-1");
    mocks.listConnectedUserIds.mockResolvedValue(["u1"]);
    mocks.readPlayback.mockResolvedValue(track());
});

describe("pollListening privacy", () => {
    it("asks Spotify only for the people who connected it", async () => {
        await pollListening(1000);

        expect(mocks.readPlayback).toHaveBeenCalledTimes(1);
        expect(mocks.readPlayback).toHaveBeenCalledWith({
            organizationId: "org-1",
            userId: "u1",
        });
    });

    it("shows nothing of a person who is not online in the space", async () => {
        mocks.listConnectedUserIds.mockResolvedValue(["u1", "away"]);

        await pollListening(1000);

        expect(mocks.readPlayback).not.toHaveBeenCalledWith({
            organizationId: "org-1",
            userId: "away",
        });
    });

    it("shows nothing for a private session, an ad or a long pause", async () => {
        mocks.readPlayback.mockResolvedValue(null);

        await pollListening(1000);

        expect(mocks.emitToRoom).not.toHaveBeenCalled();
        expect(ListeningSync.snapshot("s1")).toEqual([]);
    });

    it("clears the widget of a person who disconnected Spotify", async () => {
        await pollListening(1000);
        mocks.listConnectedUserIds.mockResolvedValue([]);

        await pollListening(11_000);

        expect(mocks.emitToRoom).toHaveBeenLastCalledWith(
            "space:s1",
            "space:music-listening",
            { userId: "u1", track: null }
        );
    });

    it("clears the widget of a person who left the space", async () => {
        await pollListening(1000);
        mocks.listUserIds.mockReturnValue(["u2"]);

        await pollListening(11_000);

        expect(ListeningSync.snapshot("s1")).toEqual([]);
    });
});

describe("pollListening change detection", () => {
    it("tells the space once for a track that keeps playing", async () => {
        await pollListening(1000);
        await pollListening(11_000);

        expect(mocks.emitToRoom).toHaveBeenCalledTimes(1);
    });

    it("tells the space when the track changes", async () => {
        await pollListening(1000);
        mocks.readPlayback.mockResolvedValue(track({ trackId: "t2" }));
        await pollListening(11_000);

        expect(mocks.emitToRoom).toHaveBeenCalledTimes(2);
    });

    it("asks once for a person in two spaces of the organization", async () => {
        mocks.listSpaceIds.mockReturnValue(["s1", "s2"]);

        await pollListening(1000);

        expect(mocks.readPlayback).toHaveBeenCalledTimes(1);
        expect(ListeningSync.snapshot("s1")).toHaveLength(1);
        expect(ListeningSync.snapshot("s2")).toHaveLength(1);
    });
});

describe("pollListening Spotify errors", () => {
    it("respects a 429 and leaves the organization alone for the wait", async () => {
        mocks.readPlayback.mockRejectedValue(
            new SpotifyRateLimitedError(20_000)
        );

        await pollListening(1000);
        mocks.readPlayback.mockClear();
        await pollListening(11_000);

        expect(mocks.readPlayback).not.toHaveBeenCalled();
    });

    it("asks again once the wait is over", async () => {
        mocks.readPlayback.mockRejectedValue(
            new SpotifyRateLimitedError(20_000)
        );

        await pollListening(1000);
        mocks.readPlayback.mockResolvedValue(track());
        await pollListening(21_001);

        expect(mocks.emitToRoom).toHaveBeenCalledTimes(1);
    });

    it("keeps what is shown when Spotify fails", async () => {
        await pollListening(1000);
        mocks.readPlayback.mockRejectedValue(new Error("down"));

        await pollListening(11_000);

        expect(ListeningSync.snapshot("s1")).toHaveLength(1);
        expect(mocks.emitToRoom).toHaveBeenCalledTimes(1);
    });

    it("does not break the other spaces when one fails", async () => {
        mocks.listSpaceIds.mockReturnValue(["s1", "s2"]);
        mocks.resolveOrganizationId.mockImplementation(async (id: string) => {
            if (id === "s1") throw new Error("gone");
            return "org-1";
        });

        await pollListening(1000);

        expect(ListeningSync.snapshot("s2")).toHaveLength(1);
    });
});
