import { beforeEach, describe, expect, it, vi } from "vitest";
import { FLOOR_MATERIALS } from "@standin/contracts";
import { FOOTSTEP_TAKE_COUNT } from "@/features/game/consts/footsteps";

const created = vi.hoisted(
    () =>
        [] as Array<{
            url: string;
            setVolume: ReturnType<typeof vi.fn>;
            play: ReturnType<typeof vi.fn>;
            destroy: ReturnType<typeof vi.fn>;
        }>
);

vi.mock("@/features/sounds/lib/SoundEffect", () => ({
    SoundEffect: class {
        setVolume = vi.fn();
        play = vi.fn(async () => true);
        destroy = vi.fn();
        url: string;
        constructor(url: string) {
            this.url = url;
            created.push(this);
        }
    },
}));

const { FootstepSounds } = await import("../FootstepSounds");

describe("FootstepSounds", () => {
    beforeEach(() => {
        created.length = 0;
    });

    it("loads every take of every material when it is made", () => {
        new FootstepSounds();

        expect(created).toHaveLength(
            Object.keys(FLOOR_MATERIALS).length * FOOTSTEP_TAKE_COUNT
        );
        expect(created.map(({ url }) => url)).toContain(
            "/sounds/footsteps/grass-04.mp3"
        );
    });

    it("plays the take of the material at the volume", () => {
        const sounds = new FootstepSounds();

        sounds.play("STONE", 2, 0.4);

        const effect = created.find(
            ({ url }) => url === "/sounds/footsteps/stone-03.mp3"
        );
        expect(effect?.setVolume).toHaveBeenCalledWith(0.4);
        expect(effect?.play).toHaveBeenCalledTimes(1);
        expect(
            created.filter(({ play }) => play.mock.calls.length > 0)
        ).toHaveLength(1);
    });

    it("ignores a take that does not exist", () => {
        const sounds = new FootstepSounds();

        sounds.play("WOOD", FOOTSTEP_TAKE_COUNT, 0.4);

        expect(created.some(({ play }) => play.mock.calls.length > 0)).toBe(
            false
        );
    });

    it("destroys every take", () => {
        const sounds = new FootstepSounds();

        sounds.destroy();

        expect(
            created.every(({ destroy }) => destroy.mock.calls.length === 1)
        ).toBe(true);
    });
});
