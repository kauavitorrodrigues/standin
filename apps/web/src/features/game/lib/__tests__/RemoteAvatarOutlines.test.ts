import { describe, expect, it, vi } from "vitest";
import { RemoteAvatarOutlines } from "../RemoteAvatarOutlines";

const build = (gone: string[] = []) => {
    const made = new Map<
        string,
        { update: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> }
    >();
    const create = vi.fn((socketId: string) => {
        if (gone.includes(socketId)) return null;

        const outline = { update: vi.fn(), destroy: vi.fn() };
        made.set(socketId, outline);
        return outline;
    });
    return { outlines: new RemoteAvatarOutlines(create), create, made };
};

describe("RemoteAvatarOutlines", () => {
    it("outlines the avatar the mouse is on", () => {
        const { outlines, made } = build();

        outlines.update("a", null);

        expect(made.get("a")?.update).toHaveBeenCalledWith(true);
    });

    it("outlines the hovered and the selected avatar together", () => {
        const { outlines, made } = build();

        outlines.update("a", "b");

        expect(made.get("a")?.update).toHaveBeenCalledWith(true);
        expect(made.get("b")?.update).toHaveBeenCalledWith(true);
    });

    it("makes one outline for an avatar that is both hovered and selected", () => {
        const { outlines, create } = build();

        outlines.update("a", "a");

        expect(create).toHaveBeenCalledTimes(1);
    });

    it("keeps the outline across frames without making it again", () => {
        const { outlines, create } = build();

        outlines.update("a", null);
        outlines.update("a", null);

        expect(create).toHaveBeenCalledTimes(1);
    });

    it("lets the outline go when the mouse leaves and nothing is selected", () => {
        const { outlines, made } = build();
        outlines.update("a", null);

        outlines.update(null, null);

        expect(made.get("a")?.destroy).toHaveBeenCalledTimes(1);
    });

    it("keeps the outline of the selected avatar when the mouse leaves", () => {
        const { outlines, made } = build();
        outlines.update("a", "a");

        outlines.update(null, "a");

        expect(made.get("a")?.destroy).not.toHaveBeenCalled();
    });

    it("makes nothing for an avatar that is gone", () => {
        const { outlines } = build(["a"]);

        expect(() => outlines.update("a", null)).not.toThrow();
    });

    it("lets go of the outline of an avatar that is removed", () => {
        const { outlines, made } = build();
        outlines.update("a", null);

        outlines.release("a");

        expect(made.get("a")?.destroy).toHaveBeenCalledTimes(1);
    });

    it("lets go of every outline on destroy", () => {
        const { outlines, made } = build();
        outlines.update("a", "b");

        outlines.destroy();

        expect(made.get("a")?.destroy).toHaveBeenCalledTimes(1);
        expect(made.get("b")?.destroy).toHaveBeenCalledTimes(1);
    });
});
