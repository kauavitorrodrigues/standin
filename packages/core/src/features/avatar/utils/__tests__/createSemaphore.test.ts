import { describe, expect, it } from "vitest";
import { createSemaphore } from "../createSemaphore";

const deferred = () => {
    let release!: () => void;
    const promise = new Promise<void>((resolve) => {
        release = resolve;
    });
    return { promise, release };
};

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("createSemaphore", () => {
    it("never runs more tasks than the limit", async () => {
        const semaphore = createSemaphore(2);
        let running = 0;
        let peak = 0;
        const gates = Array.from({ length: 5 }, deferred);

        const results = gates.map((gate, index) =>
            semaphore.run(async () => {
                running += 1;
                peak = Math.max(peak, running);
                await gate.promise;
                running -= 1;
                return index;
            })
        );

        await tick();
        expect(running).toBe(2);
        for (const gate of gates) {
            gate.release();
            await tick();
        }

        expect(await Promise.all(results)).toEqual([0, 1, 2, 3, 4]);
        expect(peak).toBe(2);
    });

    it("starts the waiting tasks in the order they arrived", async () => {
        const semaphore = createSemaphore(1);
        const order: number[] = [];
        const gate = deferred();

        const first = semaphore.run(async () => {
            await gate.promise;
            order.push(0);
        });
        const second = semaphore.run(async () => {
            order.push(1);
        });
        const third = semaphore.run(async () => {
            order.push(2);
        });

        gate.release();
        await Promise.all([first, second, third]);

        expect(order).toEqual([0, 1, 2]);
    });

    it("frees the slot when a task throws", async () => {
        const semaphore = createSemaphore(1);

        await expect(
            semaphore.run(async () => {
                throw new Error("boom");
            })
        ).rejects.toThrow("boom");

        expect(await semaphore.run(async () => "next")).toBe("next");
    });
});
