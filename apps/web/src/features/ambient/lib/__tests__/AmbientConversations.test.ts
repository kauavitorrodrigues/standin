import { describe, expect, it } from "vitest";
import {
    AMBIENT_GRACE_MS,
    AMBIENT_HIGHLIGHT_MS,
} from "../../consts/ambientConversation";
import { AmbientConversations } from "../AmbientConversations";

// Short preset, short ring: 6 tiles is inside it, 2 tiles is not.
const distances = (tiles: number) => new Map([["s1", tiles * 32]]);
const userIds = new Map([["s1", "u1"]]);

describe("AmbientConversations", () => {
    it("overhears a speaking person in the ring and highlights the start", () => {
        const ambient = new AmbientConversations();
        ambient.setSpeakingUserIds(new Set(["u1"]));

        ambient.refresh("Short", distances(6), userIds, 1000);

        expect([...ambient.getOverheard()]).toEqual(["s1"]);
        expect(ambient.getHighlighted(1000)).toEqual(["s1"]);
        expect(ambient.getHighlighted(1000 + AMBIENT_HIGHLIGHT_MS)).toEqual([]);
    });

    it("does not highlight again while the conversation goes on", () => {
        const ambient = new AmbientConversations();
        ambient.setSpeakingUserIds(new Set(["u1"]));
        ambient.refresh("Short", distances(6), userIds, 1000);

        ambient.refresh(
            "Short",
            distances(6),
            userIds,
            1000 + AMBIENT_HIGHLIGHT_MS + 1
        );

        expect(ambient.getHighlighted(1000 + AMBIENT_HIGHLIGHT_MS + 1)).toEqual(
            []
        );
        expect(ambient.getOverheard().size).toBe(1);
    });

    it("highlights again only after a quiet period longer than the grace", () => {
        const ambient = new AmbientConversations();
        ambient.setSpeakingUserIds(new Set(["u1"]));
        ambient.refresh("Short", distances(6), userIds, 1000);
        ambient.setSpeakingUserIds(new Set());
        ambient.refresh(
            "Short",
            distances(6),
            userIds,
            1000 + AMBIENT_GRACE_MS + 1
        );
        expect(ambient.getOverheard().size).toBe(0);

        ambient.setSpeakingUserIds(new Set(["u1"]));
        const later = 1000 + AMBIENT_GRACE_MS + 2;
        ambient.refresh("Short", distances(6), userIds, later);

        expect(ambient.getHighlighted(later)).toEqual(["s1"]);
    });

    it("keeps the person overheard through a pause shorter than the grace", () => {
        const ambient = new AmbientConversations();
        ambient.setSpeakingUserIds(new Set(["u1"]));
        ambient.refresh("Short", distances(6), userIds, 1000);
        ambient.setSpeakingUserIds(new Set());
        ambient.refresh(
            "Short",
            distances(6),
            userIds,
            1000 + AMBIENT_GRACE_MS
        );
        expect([...ambient.getOverheard()]).toEqual(["s1"]);

        ambient.setSpeakingUserIds(new Set(["u1"]));
        const resumed = 1000 + AMBIENT_GRACE_MS + 100;
        ambient.refresh("Short", distances(6), userIds, resumed);

        // The highlight of the start is long over and does not come back.
        expect(ambient.getHighlighted(resumed)).toEqual([]);
    });

    it("lets an ended highlight go on the next tick", () => {
        const ambient = new AmbientConversations();
        ambient.setSpeakingUserIds(new Set(["u1"]));
        ambient.refresh("Short", distances(6), userIds, 1000);

        ambient.refresh(
            "Short",
            distances(6),
            userIds,
            1000 + AMBIENT_HIGHLIGHT_MS
        );

        expect(ambient.getHighlighted(0)).toEqual([]);
    });

    it("overhears nobody who is silent or inside the proximity ring", () => {
        const ambient = new AmbientConversations();

        ambient.refresh("Short", distances(6), userIds, 1000);
        expect(ambient.getOverheard().size).toBe(0);

        ambient.setSpeakingUserIds(new Set(["u1"]));
        ambient.refresh("Short", distances(2), userIds, 1100);
        expect(ambient.getOverheard().size).toBe(0);
    });

    it("gives a volume only in the ring and only when listening", () => {
        const ambient = new AmbientConversations();

        expect(ambient.volumeAt("Short", 6 * 32)).toBeGreaterThan(0);
        expect(ambient.volumeAt("Short", 2 * 32)).toBe(0);

        ambient.setSettings({
            listenAutomatically: false,
            lowerBackgroundVolume: false,
        });
        expect(ambient.volumeAt("Short", 6 * 32)).toBe(0);

        ambient.setSettings({
            listenAutomatically: true,
            lowerBackgroundVolume: false,
        });
        ambient.setRange("off");
        expect(ambient.volumeAt("Short", 6 * 32)).toBe(0);
    });
});
