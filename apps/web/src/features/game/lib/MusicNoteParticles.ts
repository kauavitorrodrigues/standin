import type Phaser from "phaser";
import { AVATAR } from "@standin/contracts";
import {
    MUSIC_NOTE,
    MUSIC_NOTE_COLORS,
} from "@/features/game/consts/musicNotes";
import { ParticleBudget } from "@/features/game/lib/ParticleBudget";
import type {
    MusicNoteSource,
    MusicNoteState,
} from "@/features/game/types/musicNotes";
import { buildMusicNote } from "@/features/game/utils/buildMusicNote";
import {
    advanceMusicNote,
    getMusicNoteAlpha,
    isMusicNoteDone,
} from "@/features/game/utils/stepMusicNote";
import {
    nextFirstNoteDelay,
    stepNoteSpawnTimer,
} from "@/features/game/utils/stepNoteSpawnTimer";

type Piece = {
    image: Phaser.GameObjects.Image;
    state: MusicNoteState;
};

const textureKey = (colorIndex: number): string =>
    `${MUSIC_NOTE.TEXTURE_KEY_PREFIX}${colorIndex}`;

/**
 * The notes that rise from the avatars whose music plays. Like the confetti it
 * is a pool of images moved by hand each frame, with the movement decided in
 * `buildMusicNote` and `stepMusicNote`. It has a budget of its own, so it takes
 * room from neither the emojis nor the confetti, and it draws nothing while
 * the motion is reduced.
 */
export class MusicNoteParticles {
    private readonly scene: Phaser.Scene;
    private readonly random: () => number;
    private readonly budget: ParticleBudget;
    private readonly active: Piece[] = [];
    private readonly pool: Phaser.GameObjects.Image[] = [];
    // Time left until the next note of each playing avatar.
    private readonly timers = new Map<string, number>();
    private hasTextures = false;

    constructor(
        scene: Phaser.Scene,
        random: () => number = Math.random,
        budget: ParticleBudget = new ParticleBudget(MUSIC_NOTE.MAX_ACTIVE)
    ) {
        this.scene = scene;
        this.random = random;
        this.budget = budget;
    }

    /**
     * One frame. `sources` are the avatars that play music and are near enough
     * to be seen; an avatar that is not in the list stops throwing notes, and
     * the ones in the air finish their rise. With reduced motion everything
     * goes at once.
     */
    update(
        delta: number,
        sources: readonly MusicNoteSource[],
        isReducedMotion: boolean
    ): void {
        if (isReducedMotion) {
            this.clear();
            return;
        }

        this.advanceActive(delta);
        this.spawnFor(delta, sources);
    }

    destroy(): void {
        this.clear();
        this.pool.forEach((image) => image.destroy());
        this.pool.length = 0;
        this.removeTextures();
    }

    private advanceActive(delta: number): void {
        for (let index = this.active.length - 1; index >= 0; index -= 1) {
            const piece = this.active[index];
            advanceMusicNote(piece.state, delta);

            if (isMusicNoteDone(piece.state)) {
                this.release(piece.image);
                this.budget.give();
                // Iterating backwards, so the last one fills the hole.
                const last = this.active.pop();
                if (last && last !== piece) this.active[index] = last;
                continue;
            }

            this.draw(piece);
        }
    }

    private spawnFor(delta: number, sources: readonly MusicNoteSource[]): void {
        const keys = new Set(sources.map((source) => source.key));
        this.timers.forEach((_remaining, key) => {
            if (!keys.has(key)) this.timers.delete(key);
        });

        sources.forEach((source) => {
            // A new avatar throws its first note soon, at a random moment, so
            // several avatars do not throw it together.
            const remaining =
                this.timers.get(source.key) ?? nextFirstNoteDelay(this.random);
            const step = stepNoteSpawnTimer(remaining, delta, this.random);
            this.timers.set(source.key, step.remainingMs);
            if (step.shouldSpawn) this.spawn(source.feet);
        });
    }

    private spawn(feet: { x: number; y: number }): void {
        if (!this.scene.scene.isActive()) return;

        const x = feet.x;
        const y = feet.y - AVATAR.visible.h * MUSIC_NOTE.SPAWN_BODY_SHARE;
        if (!this.scene.cameras.main.worldView.contains(x, y)) return;
        if (!this.budget.tryTake()) return;

        this.ensureTextures();
        const state = buildMusicNote({ x, y, random: this.random });
        const piece: Piece = {
            image: this.acquire(textureKey(state.colorIndex)),
            state,
        };
        this.active.push(piece);
        this.draw(piece);
    }

    // Every note and timer goes, for reduced motion and for a shutdown.
    private clear(): void {
        this.active.forEach((piece) => {
            this.release(piece.image);
            this.budget.give();
        });
        this.active.length = 0;
        this.timers.clear();
    }

    // One small paper note per color: a head, a stem and a flag, drawn once
    // with Phaser's own graphics.
    private ensureTextures(): void {
        if (this.hasTextures) return;

        MUSIC_NOTE_COLORS.forEach((color, index) => {
            const key = textureKey(index);
            if (this.scene.textures.exists(key)) return;

            const graphics = this.scene.make.graphics({}, false);
            graphics.fillStyle(color, 1);
            graphics.fillEllipse(3, 9, 6, 4);
            graphics.fillRect(4.5, 1, 1.5, 8);
            graphics.fillTriangle(6, 1, 6, 5, 8, 4);
            graphics.generateTexture(key, MUSIC_NOTE.WIDTH, MUSIC_NOTE.HEIGHT);
            graphics.destroy();
        });
        this.hasTextures = true;
    }

    private removeTextures(): void {
        if (!this.hasTextures) return;

        MUSIC_NOTE_COLORS.forEach((_, index) => {
            const key = textureKey(index);
            if (this.scene.textures.exists(key))
                this.scene.textures.remove(key);
        });
        this.hasTextures = false;
    }

    private draw({ image, state }: Piece): void {
        image.setPosition(state.x, state.y);
        image.setRotation(state.rotation);
        image.setAlpha(getMusicNoteAlpha(state));
    }

    private acquire(key: string): Phaser.GameObjects.Image {
        const image =
            this.pool.pop() ??
            this.scene.add.image(0, 0, key).setDepth(MUSIC_NOTE.DEPTH);
        image.setTexture(key);
        image.setActive(true);
        image.setVisible(true);
        return image;
    }

    private release(image: Phaser.GameObjects.Image): void {
        image.setVisible(false);
        image.setActive(false);
        this.pool.push(image);
    }
}
