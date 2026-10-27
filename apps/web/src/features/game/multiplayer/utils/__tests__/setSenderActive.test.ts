import { describe, expect, it, vi } from "vitest";
import { setSenderActive } from "../setSenderActive";

const producerWith = (encodings: { active?: boolean }[]) => {
    const parameters = { encodings };
    const sender = {
        getParameters: vi.fn(() => parameters),
        setParameters: vi.fn(async () => undefined),
    };
    return { producer: { rtpSender: sender } as never, sender, parameters };
};

describe("setSenderActive", () => {
    it("turns every layer off", async () => {
        const { producer, sender, parameters } = producerWith([{}, {}]);
        await setSenderActive(producer, false);

        expect(parameters.encodings.every((e) => e.active === false)).toBe(true);
        expect(sender.setParameters).toHaveBeenCalledOnce();
    });

    it("turns every layer back on", async () => {
        const { producer, sender, parameters } = producerWith([
            { active: false },
            { active: false },
        ]);
        await setSenderActive(producer, true);

        expect(parameters.encodings.every((e) => e.active === true)).toBe(true);
        expect(sender.setParameters).toHaveBeenCalledOnce();
    });

    it("does nothing when the sender is already in that state", async () => {
        const { producer, sender } = producerWith([{ active: true }]);
        await setSenderActive(producer, true);
        expect(sender.setParameters).not.toHaveBeenCalled();
    });

    it("does nothing when there is no sender yet", async () => {
        await expect(
            setSenderActive({ rtpSender: undefined } as never, false)
        ).resolves.toBeUndefined();
    });
});
