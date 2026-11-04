import { describe, expect, it, vi } from "vitest";
import { playAvatarAnimation } from "../playAvatarAnimation";

const setup = (registered: string[]) => {
    const play = vi.fn();
    const sprite = {
        scene: { anims: { exists: (key: string) => registered.includes(key) } },
        anims: { play },
    };
    return { sprite, play };
};

describe("playAvatarAnimation", () => {
    it("plays the animation of the texture, without restarting a running one", () => {
        const { sprite, play } = setup(["avatar-sheet:ghost:WALK_left"]);

        playAvatarAnimation(sprite, "avatar-sheet:ghost", "WALK", "left");

        expect(play).toHaveBeenCalledWith("avatar-sheet:ghost:WALK_left", true);
    });

    it("does not start again the animation that is already the current one", () => {
        const { sprite, play } = setup(["avatar-sheet:ghost:SIT_down"]);
        Object.assign(sprite.anims, {
            currentAnim: { key: "avatar-sheet:ghost:SIT_down" },
        });

        playAvatarAnimation(sprite, "avatar-sheet:ghost", "SIT", "down");

        expect(play).not.toHaveBeenCalled();
    });

    it("skips an animation that was never registered", () => {
        const { sprite, play } = setup([]);

        playAvatarAnimation(sprite, "avatar-sheet:gone", "IDLE", "down");

        expect(play).not.toHaveBeenCalled();
    });
});
