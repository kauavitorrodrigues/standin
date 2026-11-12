import { beforeEach, describe, expect, it, vi } from "vitest";

const { overlay } = vi.hoisted(() => ({
    overlay: { add: vi.fn(() => 1), setProps: vi.fn() },
}));

vi.mock("phaser", () => ({
    default: {
        Scenes: { Events: { SHUTDOWN: "shutdown", RENDER: "render" } },
    },
}));
vi.mock("../NameTagOverlay", () => ({
    NameTagOverlay: { forScene: () => overlay },
}));

import { NameTag } from "../NameTag";

const build = () =>
    new NameTag({
        scene: {} as never,
        isLocal: false,
        target: {} as never,
    });

beforeEach(() => {
    overlay.add.mockClear();
    overlay.setProps.mockClear();
});

describe("NameTag away mark", () => {
    it("starts without it", () => {
        build();

        expect(overlay.setProps).not.toHaveBeenCalled();
    });

    it("puts the moon on the tag when the person goes away", () => {
        const tag = build();

        tag.setAway(true);

        expect(overlay.setProps).toHaveBeenCalledWith(1, { isAway: true });
    });

    it("takes it off when the person returns", () => {
        const tag = build();
        tag.setAway(true);

        tag.setAway(false);

        expect(overlay.setProps).toHaveBeenLastCalledWith(1, {
            isAway: false,
        });
    });

    it("builds nothing for an unchanged value, since it runs every frame", () => {
        const tag = build();
        tag.setAway(false);
        tag.setAway(true);
        overlay.setProps.mockClear();

        tag.setAway(true);
        tag.setAway(true);

        expect(overlay.setProps).not.toHaveBeenCalled();
    });
});
