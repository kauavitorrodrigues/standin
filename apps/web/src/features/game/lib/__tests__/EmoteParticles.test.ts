import { describe, expect, it, vi } from "vitest";
import { EMOTE_PARTICLE } from "@/features/game/consts/emote";
import { EmoteParticles } from "../EmoteParticles";
import { ParticleBudget } from "../ParticleBudget";
import type { EmojiTextureCache } from "../EmojiTextureCache";

const buildSprite = () => {
    const sprite = {
        setDepth: vi.fn(() => sprite),
        setScale: vi.fn(() => sprite),
        setTexture: vi.fn(() => sprite),
        setActive: vi.fn(() => sprite),
        setVisible: vi.fn(() => sprite),
        setPosition: vi.fn(() => sprite),
        setAlpha: vi.fn(() => sprite),
        destroy: vi.fn(),
    };
    return sprite;
};

const buildScene = () => {
    const sprites: ReturnType<typeof buildSprite>[] = [];
    const scene = {
        scene: { isActive: () => true },
        cameras: { main: { worldView: { contains: () => true } } },
        time: { now: 0 },
        add: {
            sprite: () => {
                const sprite = buildSprite();
                sprites.push(sprite);
                return sprite;
            },
        },
    };
    return { scene, sprites };
};

describe("EmoteParticles global cap", () => {
    it("never holds more than MAX_ACTIVE particles with 50 users emoting", () => {
        const { scene, sprites } = buildScene();
        const textures = { get: () => "key" } as unknown as EmojiTextureCache;
        const particles = new EmoteParticles(
            scene as never,
            textures,
            () => 0.5
        );

        for (let user = 0; user < 50; user += 1) {
            particles.emit({ x: user, y: 100 }, "x", 3);
        }

        expect(sprites.length).toBe(EMOTE_PARTICLE.MAX_ACTIVE);
    });

    it("counts the active particles through the budget and frees them when they end", () => {
        const { scene } = buildScene();
        const textures = { get: () => "key" } as unknown as EmojiTextureCache;
        const budget = new ParticleBudget();
        const particles = new EmoteParticles(
            scene as never,
            textures,
            () => 0.5,
            budget
        );

        for (let user = 0; user < 50; user += 1) {
            particles.emit({ x: user, y: 100 }, "x", 3);
        }
        expect(budget.count).toBe(EMOTE_PARTICLE.MAX_ACTIVE);

        particles.update(60_000);
        particles.update(60_000);
        expect(budget.count).toBe(0);
    });

    it("shares the cap with another emitter on the same budget", () => {
        const { scene } = buildScene();
        const textures = { get: () => "key" } as unknown as EmojiTextureCache;
        const budget = new ParticleBudget(4);
        const first = new EmoteParticles(
            scene as never,
            textures,
            () => 0.5,
            budget
        );
        const second = new EmoteParticles(
            scene as never,
            textures,
            () => 0.5,
            budget
        );

        first.emit({ x: 0, y: 0 }, "x", 3);
        second.emit({ x: 0, y: 0 }, "x", 3);

        expect(budget.count).toBe(4);
    });
});
