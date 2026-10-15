import { describe, expect, it } from "vitest";
import {
    RoomDoorView,
    type DoorSprite,
    type DoorViewScene,
} from "../RoomDoorView";

const makeSprite = () => {
    const calls: string[] = [];
    const sprite: DoorSprite = {
        depth: 5,
        anims: { stop: () => calls.push("stop") },
        setFrame: (frame) => calls.push(`frame:${frame}`),
        play: ({ key, repeat }) => calls.push(`play:${key}:${repeat}`),
        playReverse: ({ key, repeat }) => calls.push(`rev:${key}:${repeat}`),
        getCenter: () => ({ x: 10, y: 20 }),
    };
    return { sprite, calls };
};

const makeScene = () => {
    const log: string[] = [];
    const image = {
        setOrigin: (x: number, y: number) => log.push(`origin:${x},${y}`),
        setScale: (scale: number) => log.push(`scale:${scale}`),
        setDepth: (depth: number) => log.push(`depth:${depth}`),
        setPosition: (x: number, y: number) => log.push(`pos:${x},${y}`),
        setVisible: (visible: boolean) => log.push(`visible:${visible}`),
        destroy: () => log.push("destroy"),
    };
    const scene: DoorViewScene = {
        add: {
            image: (_x, _y, texture) => {
                log.push(`texture:${texture}`);
                return image;
            },
        },
    };
    return { scene, log };
};

const setup = (frameCount = 4) => {
    const { sprite, calls } = makeSprite();
    const { scene, log } = makeScene();
    const view = new RoomDoorView(scene, { getSprite: () => sprite });
    view.setDoors([{ id: "d1", roomKey: "r1", assetId: "a1", frameCount }]);
    return { view, calls, log };
};

describe("RoomDoorView", () => {
    it("snaps on the first state", () => {
        const { view, calls } = setup();
        view.apply(new Map([["r1", "open"]]));
        expect(calls).toEqual(["stop", "frame:3"]);
    });

    it("plays forward to open and backward to close once", () => {
        const { view, calls } = setup();
        view.apply(new Map([["r1", "closed"]]));
        calls.length = 0;
        view.apply(new Map([["r1", "open"]]));
        view.apply(new Map([["r1", "closed"]]));
        expect(calls).toEqual(["play:asset:a1:0", "rev:asset:a1:0"]);
    });

    it("draws a padlock image only while locked", () => {
        const { view, log } = setup();
        view.apply(new Map([["r1", "locked"]]));
        expect(log).toContain("pos:10,20");
        expect(log).toContain("visible:true");
        view.apply(new Map([["r1", "closed"]]));
        expect(log.at(-1)).toBe("visible:false");
    });

    it("leaves the sprite alone without an animation", () => {
        const { view, calls } = setup(1);
        view.apply(new Map([["r1", "open"]]));
        view.apply(new Map([["r1", "closed"]]));
        expect(calls).toEqual([]);
    });
});
