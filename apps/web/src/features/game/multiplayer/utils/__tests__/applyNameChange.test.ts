import { describe, expect, it, vi } from "vitest";
import { applyNameChange } from "../applyNameChange";

const change = { userId: "ana", name: "Ana Souza" };

describe("applyNameChange", () => {
    it("changes the tag of someone else in the scene", () => {
        const scene = { setUserName: vi.fn() };
        const updateOwnName = vi.fn();

        applyNameChange({ change, selfUserId: "bruno", scene, updateOwnName });

        expect(scene.setUserName).toHaveBeenCalledWith("ana", "Ana Souza");
        expect(updateOwnName).not.toHaveBeenCalled();
    });

    it("updates the name of the signed in person when it is them, from another tab", () => {
        const scene = { setUserName: vi.fn() };
        const updateOwnName = vi.fn();

        applyNameChange({ change, selfUserId: "ana", scene, updateOwnName });

        expect(updateOwnName).toHaveBeenCalledWith("Ana Souza");
        expect(scene.setUserName).not.toHaveBeenCalled();
    });

    it("does not fail while there is no scene", () => {
        const updateOwnName = vi.fn();

        expect(() =>
            applyNameChange({
                change,
                selfUserId: "bruno",
                scene: null,
                updateOwnName,
            })
        ).not.toThrow();
    });
});
