import { describe, expect, it } from "vitest";
import {
    computeSceneSignature,
    type SignableScene,
} from "../computeSceneSignature";

const createScene = (): SignableScene => ({
    children: {
        list: [
            { x: 1, y: 2, frame: { name: "a" } },
            { list: [{ x: 3, y: 4, text: "hi" }] },
        ],
    },
    cameras: {
        cameras: [
            {
                scrollX: 0,
                scrollY: 0,
                zoom: 1,
                width: 10,
                height: 10,
                alpha: 1,
            },
        ],
    },
});

describe("computeSceneSignature", () => {
    it("is stable while nothing changes", () => {
        const scene = createScene();

        expect(computeSceneSignature(scene)).toBe(computeSceneSignature(scene));
    });

    it("changes with a position, a frame, a nested text and the camera", () => {
        const base = computeSceneSignature(createScene());
        const moved = createScene();
        moved.children.list[0].x = 2;
        const framed = createScene();
        framed.children.list[0].frame = { name: "b" };
        const retexted = createScene();
        retexted.children.list[1].list![0].text = "ho";
        const scrolled = createScene();
        scrolled.cameras.cameras[0].scrollY = 1;

        const others = [moved, framed, retexted, scrolled].map(
            computeSceneSignature
        );
        expect(others.every((value) => value !== base)).toBe(true);
    });
});
