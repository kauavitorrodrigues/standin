import type Phaser from "phaser";
import { AVATAR } from "@standin/contracts";
import {
    CONFETTI_COLORS,
    CONFETTI_PIECE,
} from "@/features/game/consts/confetti";
import { ParticleBudget } from "@/features/game/lib/ParticleBudget";
import type { ConfettiPieceState } from "@/features/game/types/confetti";
import { buildConfettiPieces } from "@/features/game/utils/buildConfettiPieces";
import { prefersReducedMotion } from "@/features/game/utils/prefersReducedMotion";
import {
    advanceConfettiPiece,
    getConfettiPieceAlpha,
    getConfettiPieceScaleY,
    isConfettiPieceDone,
} from "@/features/game/utils/stepConfettiPiece";

type Piece = {
    image: Phaser.GameObjects.Image;
    state: ConfettiPieceState;
};

type Point = { x: number; y: number };

const textureKey = (colorIndex: number): string =>
    `${CONFETTI_PIECE.TEXTURE_KEY_PREFIX}${colorIndex}`;

/**
 * The confetti of a burst: small colored paper pieces thrown up from an avatar
 * that tumble down and fade. Like the emoji particles it is a pool of images
 * moved by hand each frame, with the movement decided in `buildConfettiPieces`
 * and `stepConfettiPiece`; this class only owns the images and the textures.
 * It has a budget of its own, so it never takes room from the emojis.
 */
export class ConfettiParticles {
    private readonly scene: Phaser.Scene;
    private readonly random: () => number;
    private readonly budget: ParticleBudget;
    private readonly active: Piece[] = [];
    private readonly pool: Phaser.GameObjects.Image[] = [];
    private hasTextures = false;

    constructor(
        scene: Phaser.Scene,
        random: () => number = Math.random,
        budget: ParticleBudget = new ParticleBudget(CONFETTI_PIECE.MAX_ACTIVE)
    ) {
        this.scene = scene;
        this.random = random;
        this.budget = budget;
    }

    // `feet` is the anchor of the avatar, in world px.
    burst(feet: Point): void {
        if (!this.scene.scene.isActive()) return;

        const x = feet.x;
        const y = feet.y - AVATAR.visible.h * CONFETTI_PIECE.SPAWN_BODY_SHARE;
        if (!this.scene.cameras.main.worldView.contains(x, y)) return;

        this.ensureTextures();
        buildConfettiPieces({
            x,
            y,
            isReducedMotion: prefersReducedMotion(),
            random: this.random,
        }).forEach((state) => this.spawn(state));
    }

    // delta is Phaser's per-frame delta in milliseconds.
    update(delta: number): void {
        for (let index = this.active.length - 1; index >= 0; index -= 1) {
            const piece = this.active[index];
            advanceConfettiPiece(piece.state, delta);

            if (isConfettiPieceDone(piece.state)) {
                this.release(piece.image);
                this.budget.give();
                // Iterating backwards, so the last one fills the hole and
                // nothing shifts.
                const last = this.active.pop();
                if (last && last !== piece) this.active[index] = last;
                continue;
            }

            this.draw(piece);
        }
    }

    destroy(): void {
        this.active.forEach((piece) => {
            piece.image.destroy();
            this.budget.give();
        });
        this.active.length = 0;
        this.pool.forEach((image) => image.destroy());
        this.pool.length = 0;
        this.removeTextures();
    }

    // One small rectangle per color, drawn once with Phaser's own graphics.
    private ensureTextures(): void {
        if (this.hasTextures) return;

        CONFETTI_COLORS.forEach((color, index) => {
            const key = textureKey(index);
            if (this.scene.textures.exists(key)) return;

            const graphics = this.scene.make.graphics({}, false);
            graphics.fillStyle(color, 1);
            graphics.fillRect(
                0,
                0,
                CONFETTI_PIECE.WIDTH,
                CONFETTI_PIECE.HEIGHT
            );
            graphics.generateTexture(
                key,
                CONFETTI_PIECE.WIDTH,
                CONFETTI_PIECE.HEIGHT
            );
            graphics.destroy();
        });
        this.hasTextures = true;
    }

    private removeTextures(): void {
        if (!this.hasTextures) return;

        CONFETTI_COLORS.forEach((_, index) => {
            const key = textureKey(index);
            if (this.scene.textures.exists(key))
                this.scene.textures.remove(key);
        });
        this.hasTextures = false;
    }

    private spawn(state: ConfettiPieceState): void {
        if (!this.budget.tryTake()) return;

        const piece: Piece = {
            image: this.acquire(textureKey(state.colorIndex)),
            state,
        };
        this.active.push(piece);
        this.draw(piece);
    }

    // Puts the image where its state says.
    private draw({ image, state }: Piece): void {
        image.setPosition(state.x, state.y);
        image.setRotation(state.rotation);
        image.setScale(1, getConfettiPieceScaleY(state));
        image.setAlpha(getConfettiPieceAlpha(state));
    }

    private acquire(key: string): Phaser.GameObjects.Image {
        const image =
            this.pool.pop() ??
            this.scene.add.image(0, 0, key).setDepth(CONFETTI_PIECE.DEPTH);
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
