import { describe, expect, it, vi } from "vitest";
import { CONFETTI_PIECE } from "@/features/game/consts/confetti";
import { ConfettiParticles } from "../ConfettiParticles";

const buildImage = () => {
    const image = {
        setDepth: vi.fn(() => image),
        setTexture: vi.fn(() => image),
        setActive: vi.fn(() => image),
        setVisible: vi.fn(() => image),
        setPosition: vi.fn(() => image),
        setRotation: vi.fn(() => image),
        setScale: vi.fn(() => image),
        setAlpha: vi.fn(() => image),
        destroy: vi.fn(),
    };
    return image;
};

const buildScene = (contains: () => boolean = () => true) => {
    const images: ReturnType<typeof buildImage>[] = [];
    const textures = new Set<string>();
    const graphics = {
        fillStyle: vi.fn(),
        fillRect: vi.fn(),
        generateTexture: vi.fn((key: string) => textures.add(key)),
        destroy: vi.fn(),
    };
    const scene = {
        scene: { isActive: () => true },
        cameras: { main: { worldView: { contains } } },
        make: { graphics: () => graphics },
        textures: {
            exists: (key: string) => textures.has(key),
            remove: (key: string) => textures.delete(key),
        },
        add: {
            image: () => {
                const image = buildImage();
                images.push(image);
                return image;
            },
        },
    };
    return { scene, images, textures };
};

describe("ConfettiParticles", () => {
    it("throws one burst of pieces and draws a texture per color once", () => {
        const { scene, images, textures } = buildScene();
        const confetti = new ConfettiParticles(scene as never);

        confetti.burst({ x: 50, y: 50 });
        confetti.burst({ x: 50, y: 50 });

        expect(images.length).toBe(CONFETTI_PIECE.PER_BURST * 2);
        expect(textures.size).toBeGreaterThan(1);
    });

    it("throws nothing outside the camera", () => {
        const { scene, images } = buildScene(() => false);

        new ConfettiParticles(scene as never).burst({ x: 5000, y: 5000 });

        expect(images).toHaveLength(0);
    });

    it("never holds more than MAX_ACTIVE pieces however many bursts come", () => {
        const { scene, images } = buildScene();
        const confetti = new ConfettiParticles(scene as never);

        for (let i = 0; i < 50; i += 1) confetti.burst({ x: 50, y: 50 });

        expect(images.length).toBeLessThanOrEqual(CONFETTI_PIECE.MAX_ACTIVE);
    });

    it("gives the pieces back to the pool once their life is over", () => {
        const { scene, images } = buildScene();
        const confetti = new ConfettiParticles(scene as never);

        confetti.burst({ x: 50, y: 50 });
        confetti.update(CONFETTI_PIECE.LIFE_MAX_MS + 1);
        confetti.burst({ x: 50, y: 50 });

        expect(images).toHaveLength(CONFETTI_PIECE.PER_BURST);
    });

    it("removes its textures and images on destroy", () => {
        const { scene, images, textures } = buildScene();
        const confetti = new ConfettiParticles(scene as never);
        confetti.burst({ x: 50, y: 50 });

        confetti.destroy();

        expect(textures.size).toBe(0);
        images.forEach((image) => expect(image.destroy).toHaveBeenCalled());
    });
});
