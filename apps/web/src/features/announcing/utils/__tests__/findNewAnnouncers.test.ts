import { describe, expect, it } from "vitest";
import type { SpaceAnnouncer } from "@standin/contracts";
import { findNewAnnouncers } from "../findNewAnnouncers";

const make = (socketId: string): SpaceAnnouncer => ({
    socketId,
    userId: `user-${socketId}`,
    announcingSince: 1,
});

describe("findNewAnnouncers", () => {
    it("finds a socket that was not in the previous list", () => {
        expect(findNewAnnouncers([make("a")], [make("a"), make("b")])).toEqual([
            make("b"),
        ]);
    });

    it("finds everybody when the previous list was empty", () => {
        expect(findNewAnnouncers([], [make("a")])).toEqual([make("a")]);
    });

    it("finds nobody when the same people remain", () => {
        expect(findNewAnnouncers([make("a")], [make("a")])).toEqual([]);
    });

    it("finds nobody when someone only left", () => {
        expect(findNewAnnouncers([make("a"), make("b")], [make("b")])).toEqual(
            []
        );
    });

    it("finds nobody when the list became empty", () => {
        expect(findNewAnnouncers([make("a")], [])).toEqual([]);
    });
});
