import { RENDER_ON_DEMAND } from "@/features/game/consts/render-on-demand";
import {
    computeSceneSignature,
    type SignableScene,
} from "@/features/game/utils/computeSceneSignature";

// Phaser event names, written out so this file does not load Phaser.
const READY_EVENT = "ready";
const RESIZE_EVENT = "resize";
const TEXTURE_ADD_EVENT = "addtexture";
const TEXTURE_REMOVE_EVENT = "removetexture";

type RenderTarget = {
    preRender: () => void;
    postRender: () => void;
};

type GameLike = {
    renderer?: RenderTarget;
    scene: {
        render: (renderer: never) => void;
        getScenes: (active?: boolean) => unknown[];
    };
    scale: {
        on: (event: string, fn: () => void) => unknown;
        off: (event: string, fn: () => void) => unknown;
    };
    textures: {
        on: (event: string, fn: () => void) => unknown;
        off: (event: string, fn: () => void) => unknown;
    };
    events: { once: (event: string, fn: () => void) => unknown };
};

/**
 * Makes the Phaser loop render on demand: nothing is drawn
 * while the scene is still (the canvas keeps its last picture, so there are
 * zero GL calls), and while something moves or animates the passes are capped
 * at MOVING_HZ. The loop keeps running, so game logic and input are untouched.
 * The fps limit of the settings stays on top of this cap.
 */
export class RenderOnDemand {
    private readonly game: GameLike;
    private readonly now: () => number;
    private readonly minIntervalMs = 1000 / RENDER_ON_DEMAND.MOVING_HZ;
    private lastSignature: number | null = null;
    private lastRenderAt = Number.NEGATIVE_INFINITY;
    private forced = true;
    private drawing = false;
    private passes = 0;
    private installed = false;
    private restore: (() => void) | null = null;

    constructor(game: GameLike, now: () => number = () => performance.now()) {
        this.game = game;
        this.now = now;
    }

    get renderPasses(): number {
        return this.passes;
    }

    // Draws the next frame no matter the cadence. For what the signature can
    // not see, such as a texture redrawn in place, and for a resize, which
    // clears the canvas.
    markDirty(): void {
        this.forced = true;
    }

    install(): void {
        if (this.installed) return;
        const renderer = this.game.renderer;
        if (!renderer) {
            this.game.events.once(READY_EVENT, () => this.install());
            return;
        }
        this.installed = true;

        const { preRender, postRender } = renderer;
        const sceneRender = this.game.scene.render.bind(this.game.scene);
        const markDirty = () => this.markDirty();

        renderer.preRender = () => {
            this.drawing = this.decide();
            if (this.drawing) preRender.call(renderer);
        };
        renderer.postRender = () => {
            if (this.drawing) postRender.call(renderer);
        };
        this.game.scene.render = (target) => {
            if (this.drawing) sceneRender(target);
        };

        this.game.scale.on(RESIZE_EVENT, markDirty);
        this.game.textures.on(TEXTURE_ADD_EVENT, markDirty);
        this.game.textures.on(TEXTURE_REMOVE_EVENT, markDirty);

        this.restore = () => {
            renderer.preRender = preRender;
            renderer.postRender = postRender;
            this.game.scene.render = sceneRender;
            this.game.scale.off(RESIZE_EVENT, markDirty);
            this.game.textures.off(TEXTURE_ADD_EVENT, markDirty);
            this.game.textures.off(TEXTURE_REMOVE_EVENT, markDirty);
        };
    }

    uninstall(): void {
        this.restore?.();
        this.restore = null;
        this.installed = false;
    }

    // The signature is only stored when a pass happens, so a change held back
    // by the cadence stays dirty and is drawn on the next frame that is due.
    private decide(): boolean {
        const signature = this.readSignature();
        const changed = signature !== this.lastSignature;
        if (!changed && !this.forced) return false;

        const at = this.now();
        if (!this.forced && at - this.lastRenderAt < this.minIntervalMs) {
            return false;
        }

        this.forced = false;
        this.lastSignature = signature;
        this.lastRenderAt = at;
        this.passes += 1;
        return true;
    }

    private readSignature(): number {
        let hash = 0;
        for (const scene of this.game.scene.getScenes(true)) {
            hash =
                (Math.imul(hash, 31) +
                    computeSceneSignature(scene as SignableScene)) >>>
                0;
        }
        return hash;
    }
}
