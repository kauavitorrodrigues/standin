import { describe, expect, it } from "vitest";
import {
    computeSceneSignature,
    computeSceneSignatures,
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

describe("computeSceneSignatures", () => {
    const withWater = (): SignableScene => {
        const scene = createScene();
        scene.children.list.push({
            x: 8,
            y: 8,
            frame: { name: "w0" },
            getData: (key: string) => key === "ambient",
        });
        return scene;
    };

    it("a change of the ambient scenery moves only the ambient signature", () => {
        const before = computeSceneSignatures(withWater());
        const scene = withWater();
        scene.children.list[2].frame = { name: "w1" };
        const after = computeSceneSignatures(scene);

        expect(after.ambient).not.toBe(before.ambient);
        expect(after.motion).toBe(before.motion);
    });

    it("a change of anything else moves only the motion signature", () => {
        const before = computeSceneSignatures(withWater());
        const scene = withWater();
        scene.children.list[0].x = 40;
        scene.cameras.cameras[0].scrollX = 3;
        const after = computeSceneSignatures(scene);

        expect(after.motion).not.toBe(before.motion);
        expect(after.ambient).toBe(before.ambient);
    });

    it("the single number still changes with either of them", () => {
        const base = computeSceneSignature(withWater());
        const water = withWater();
        water.children.list[2].frame = { name: "w1" };
        const moved = withWater();
        moved.children.list[0].x = 40;

        expect(computeSceneSignature(water)).not.toBe(base);
        expect(computeSceneSignature(moved)).not.toBe(base);
    });

    it("an object that only says it is not ambient counts as motion", () => {
        const scene = createScene();
        scene.children.list[0].getData = () => false;
        const { motion, ambient } = computeSceneSignatures(scene);
        const plain = computeSceneSignatures(createScene());

        expect(motion).toBe(plain.motion);
        expect(ambient).toBe(plain.ambient);
    });
});
