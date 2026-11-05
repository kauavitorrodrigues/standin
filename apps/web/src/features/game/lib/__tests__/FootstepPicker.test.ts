import { describe, expect, it } from "vitest";
import { FOOTSTEP_THROTTLE_MS } from "@/features/game/consts/footsteps";
import { FootstepPicker } from "../FootstepPicker";

const seeded = (values: number[]) => {
    let index = 0;
    return () => values[index++ % values.length] ?? 0;
};

describe("FootstepPicker", () => {
    it("sounds the first step at once", () => {
        const picker = new FootstepPicker(4);

        expect(picker.pick("a", 0, () => 0)).toBe(0);
    });

    it("holds a player back inside the throttle window", () => {
        const picker = new FootstepPicker(4);
        picker.pick("a", 1000, () => 0);

        expect(picker.pick("a", 1000 + FOOTSTEP_THROTTLE_MS - 1, () => 0)).toBe(
            null
        );
    });

    it("sounds again once the window has passed", () => {
        const picker = new FootstepPicker(4);
        picker.pick("a", 1000, () => 0);

        expect(
            picker.pick("a", 1000 + FOOTSTEP_THROTTLE_MS, () => 0.99)
        ).not.toBe(null);
    });

    it("does not count a throttled step against the window", () => {
        const picker = new FootstepPicker(4);
        picker.pick("a", 0, () => 0);
        picker.pick("a", 100, () => 0);

        expect(picker.pick("a", FOOTSTEP_THROTTLE_MS, () => 0)).not.toBe(null);
    });

    it("throttles each player on its own", () => {
        const picker = new FootstepPicker(4);
        picker.pick("a", 0, () => 0);

        expect(picker.pick("b", 10, () => 0)).not.toBe(null);
    });

    it("never repeats the take of the step before, whatever the draw", () => {
        const picker = new FootstepPicker(4);
        let previous = picker.pick("a", 0, () => 0);

        for (let step = 1; step <= 40; step += 1) {
            const take = picker.pick(
                "a",
                step * FOOTSTEP_THROTTLE_MS,
                seeded([0, 0.26, 0.51, 0.76, 0.99])
            );

            expect(take).not.toBe(previous);
            previous = take;
        }
    });

    it("can reach every take other than the last one", () => {
        const takes = new Set<number | null>();

        for (const draw of [0, 0.34, 0.67, 0.99]) {
            const picker = new FootstepPicker(4);
            picker.pick("a", 0, () => 0);
            takes.add(picker.pick("a", FOOTSTEP_THROTTLE_MS, () => draw));
        }

        expect([...takes].sort()).toEqual([1, 2, 3]);
    });

    it("stays inside the takes that exist", () => {
        const picker = new FootstepPicker(3);

        for (let step = 0; step < 30; step += 1) {
            const take = picker.pick(
                "a",
                step * FOOTSTEP_THROTTLE_MS,
                () => 0.999999
            );
            expect(take).toBeGreaterThanOrEqual(0);
            expect(take).toBeLessThan(3);
        }
    });

    it("plays the only take it has again and again", () => {
        const picker = new FootstepPicker(1);
        picker.pick("a", 0, () => 0.9);

        expect(picker.pick("a", FOOTSTEP_THROTTLE_MS, () => 0.9)).toBe(0);
    });

    it("forgets a player that left", () => {
        const picker = new FootstepPicker(4);
        picker.pick("a", 0, () => 0);
        picker.remove("a");

        expect(picker.pick("a", 10, () => 0)).toBe(0);
    });
});
