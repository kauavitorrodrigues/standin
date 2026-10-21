import type Phaser from "phaser";
import { AVATAR } from "@standin/contracts";
import { EMOTE_DEPTH, EMOTE_PARTICLE } from "@/features/game/consts/emote";
import type { EmojiTextureCache } from "@/features/game/lib/EmojiTextureCache";
import type {
    EmoteParticleMotion,
    EmoteParticleState,
} from "@/features/game/types/emote";
import { buildEmoteMotions } from "@/features/game/utils/buildEmoteMotions";
import { prefersReducedMotion } from "@/features/game/utils/prefersReducedMotion";
import {
    getEmoteParticleAlpha,
    isEmoteParticleDone,
    isEmoteParticleWaiting,
    stepEmoteParticle,
} from "@/features/game/utils/stepEmoteParticle";

type Particle = {
    sprite: Phaser.GameObjects.Sprite;
    state: EmoteParticleState;
};

type Point = { x: number; y: number };

/**
 * The emojis that float up from an avatar. A pool of sprites moved by hand
 * each frame: the volume is low (a combo is a few emojis) and it needs
 * neither the Arcade physics nor an emitter. How they move is decided in
 * `buildEmoteMotions` and `stepEmoteParticle`; this class only owns the
 * sprites. A particle is born at the moment of the event and does not follow
 * the avatar after it.
 */
export class EmoteParticles {
    private readonly scene: Phaser.Scene;
    private readonly textures: EmojiTextureCache;
    private readonly random: () => number;
    private readonly active: Particle[] = [];
    private readonly pool: Phaser.GameObjects.Sprite[] = [];

    constructor(
        scene: Phaser.Scene,
        textures: EmojiTextureCache,
        random: () => number = Math.random
    ) {
        this.scene = scene;
        this.textures = textures;
        this.random = random;
    }

    // `feet` is the anchor of the avatar, in world px.
    emit(feet: Point, emoji: string, count: number): void {
        if (!this.scene.scene.isActive()) return;

        const origin = {
            x: feet.x,
            y: feet.y - AVATAR.visible.h * EMOTE_PARTICLE.SPAWN_BODY_SHARE,
        };
        if (!this.scene.cameras.main.worldView.contains(origin.x, origin.y)) {
            return;
        }

        const key = this.textures.get(emoji, this.scene.time.now);
        if (key === null) return;

        buildEmoteMotions({
            count,
            isReducedMotion: prefersReducedMotion(),
            random: this.random,
        }).forEach((motion) => this.spawn(origin, key, motion));
    }

    // delta is Phaser's per-frame delta in milliseconds.
    update(delta: number): void {
        for (let index = this.active.length - 1; index >= 0; index -= 1) {
            const particle = this.active[index];
            particle.state = stepEmoteParticle(particle.state, delta);

            if (isEmoteParticleDone(particle.state)) {
                this.release(particle.sprite);
                this.active.splice(index, 1);
                continue;
            }

            this.draw(particle);
        }
    }

    destroy(): void {
        this.active.forEach((particle) => particle.sprite.destroy());
        this.active.length = 0;
        this.pool.forEach((sprite) => sprite.destroy());
        this.pool.length = 0;
    }

    private spawn(
        origin: Point,
        key: string,
        motion: EmoteParticleMotion
    ): void {
        if (this.active.length >= EMOTE_PARTICLE.MAX_ACTIVE) return;

        const particle: Particle = {
            sprite: this.acquire(key),
            state: { ...motion, ...origin, ageMs: 0 },
        };
        this.active.push(particle);
        this.draw(particle);
    }

    // Puts the sprite where its state says.
    private draw({ sprite, state }: Particle): void {
        sprite.setVisible(!isEmoteParticleWaiting(state));
        sprite.setPosition(state.x, state.y);
        sprite.setAlpha(getEmoteParticleAlpha(state));
    }

    private acquire(key: string): Phaser.GameObjects.Sprite {
        const sprite =
            this.pool.pop() ??
            this.scene.add
                .sprite(0, 0, key)
                .setDepth(EMOTE_DEPTH)
                .setScale(EMOTE_PARTICLE.SCALE);
        sprite.setTexture(key);
        sprite.setActive(true);
        return sprite;
    }

    private release(sprite: Phaser.GameObjects.Sprite): void {
        sprite.setVisible(false);
        sprite.setActive(false);
        this.pool.push(sprite);
    }
}
