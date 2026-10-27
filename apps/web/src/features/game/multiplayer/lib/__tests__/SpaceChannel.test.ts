import { describe, expect, it, vi } from "vitest";
import { SpaceChannel } from "../SpaceChannel";

const position = { x: 10, y: 20, direction: "down", isSitting: false } as const;

const build = () => {
    let time = 1000;
    const volatileEmit = vi.fn();
    const emit = vi.fn();
    const channel = new SpaceChannel(
        { emit, volatile: { emit: volatileEmit } },
        () => time
    );
    return {
        channel,
        emit,
        volatileEmit,
        advance: (ms: number) => {
            time += ms;
        },
    };
};

describe("SpaceChannel", () => {
    it("sends the first position reliably, since the server knows nobody without one", () => {
        const { channel, emit, volatileEmit } = build();

        channel.sendPosition(position);

        expect(emit).toHaveBeenCalledWith("space:position", position);
        expect(volatileEmit).not.toHaveBeenCalled();
    });

    it("sends the next positions volatile", () => {
        const { channel, emit, volatileEmit, advance } = build();
        channel.sendPosition(position);
        advance(100);
        channel.sendPosition({ ...position, x: 50 });

        expect(emit).toHaveBeenCalledTimes(1);
        expect(volatileEmit).toHaveBeenCalledWith("space:position", {
            ...position,
            x: 50,
        });
    });

    it("does not resend a position that did not change", () => {
        const { channel, emit, volatileEmit, advance } = build();
        channel.sendPosition(position);
        advance(500);
        channel.sendPosition({ ...position, x: 10.2 });

        expect(emit).toHaveBeenCalledTimes(1);
        expect(volatileEmit).not.toHaveBeenCalled();
    });

    it("sends a changed position, but not faster than the interval", () => {
        const { channel, volatileEmit, advance } = build();
        channel.sendPosition(position);
        advance(10);
        channel.sendPosition({ ...position, x: 50 });
        expect(volatileEmit).not.toHaveBeenCalled();

        advance(100);
        channel.sendPosition({ ...position, x: 50 });
        expect(volatileEmit).toHaveBeenCalledTimes(1);
    });

    it("sends the same position again after a reset, reliably", () => {
        const { channel, emit, advance } = build();
        channel.sendPosition(position);
        channel.resetPosition();
        advance(100);
        channel.sendPosition(position);

        expect(emit).toHaveBeenCalledTimes(2);
    });

    it("sends the discrete events through the reliable path", () => {
        const { channel, emit } = build();

        channel.sendEmote({ emoji: "👍", count: 1 });
        channel.sendNearbyMessage({ text: "oi" });
        channel.sendNearbyTyping({ isTyping: true });
        channel.sendChatTyping({ conversationId: "c1", isTyping: false });

        expect(emit.mock.calls.map(([event]) => event)).toEqual([
            "space:emote",
            "space:nearby-message",
            "space:nearby-typing",
            "chat:typing",
        ]);
    });
});
