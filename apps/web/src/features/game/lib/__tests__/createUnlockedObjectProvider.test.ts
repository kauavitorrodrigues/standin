import { describe, expect, it, vi } from "vitest";
import type { EditorModel } from "@standin/contracts";
import { createUnlockedObjectProvider } from "@/features/game/lib/createUnlockedObjectProvider";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";

const hitTest = vi.hoisted(() => vi.fn());

vi.mock("@/features/editor/lib/createObjectSelectionProvider", () => ({
    createObjectSelectionProvider: () => ({ hitTest }),
}));

const model = {
    placed: [
        { id: "mine", parentId: null },
        { id: "theirs", parentId: null },
        { id: "item-on-theirs", parentId: "theirs" },
    ],
} as unknown as EditorModel;

describe("createUnlockedObjectProvider", () => {
    it("hit tests only the objects that are not locked", () => {
        const provider = createUnlockedObjectProvider(
            {} as ToolEnv,
            (_model, id) => id === "theirs" || id === "item-on-theirs"
        );

        provider.hitTest({ model, worldX: 1, worldY: 2 });

        const asked = hitTest.mock.calls[0]?.[0] as {
            model: EditorModel;
            worldX: number;
            worldY: number;
        };
        expect(asked.model.placed.map(({ id }) => id)).toEqual(["mine"]);
        expect([asked.worldX, asked.worldY]).toEqual([1, 2]);
    });

    it("answers what the provider of the editor answers", () => {
        hitTest.mockReturnValueOnce({ kind: "object", id: "mine" });
        const provider = createUnlockedObjectProvider(
            {} as ToolEnv,
            () => false
        );

        expect(provider.hitTest({ model, worldX: 0, worldY: 0 })).toEqual({
            kind: "object",
            id: "mine",
        });
    });
});
