import { RENDER_ON_DEMAND } from "@/features/game/consts/render-on-demand";
import {
    computeSceneSignatures,
    type SceneSignatures,
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
 * zero GL calls), and while something moves the passes are capped at
 * MOVING_HZ. When the only change is scenery animating by itself (objects
 * marked with AMBIENT_DATA_KEY) the cap is the much lower AMBIENT_HZ, since
 * nobody needs water to ripple at the pace of a walk. The loop keeps running,
 * so game logic and input are untouched. The fps limit of the settings stays
 * on top of this cap.
 */
export class RenderOnDemand {
    private readonly game: GameLike;
    private readonly now: () => number;
    private readonly movingIntervalMs = 1000 / RENDER_ON_DEMAND.MOVING_HZ;
    private readonly ambientIntervalMs = 1000 / RENDER_ON_DEMAND.AMBIENT_HZ;
    private lastSignatures: SceneSignatures | null = null;
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

    // The signatures are only stored when a pass happens, so a change held
    // back by the cadence stays dirty and is drawn on the next frame that is
    // due. A change of anything but the ambient scenery is due at the pace of
    // MOVING_HZ, one of the scenery alone at the pace of AMBIENT_HZ.
    private decide(): boolean {
        const signatures = this.readSignatures();
        const last = this.lastSignatures;
        const motionChanged = !last || signatures.motion !== last.motion;
        const ambientChanged = !last || signatures.ambient !== last.ambient;
        if (!motionChanged && !ambientChanged && !this.forced) return false;

        const at = this.now();
        const intervalMs = motionChanged
            ? this.movingIntervalMs
            : this.ambientIntervalMs;
        if (!this.forced && at - this.lastRenderAt < intervalMs) {
            return false;
        }

        this.forced = false;
        this.lastSignatures = signatures;
        this.lastRenderAt = at;
        this.passes += 1;
        return true;
    }

    private readSignatures(): SceneSignatures {
        let motion = 0;
        let ambient = 0;
        for (const scene of this.game.scene.getScenes(true)) {
            const signatures = computeSceneSignatures(scene as SignableScene);
            motion = (Math.imul(motion, 31) + signatures.motion) >>> 0;
            ambient = (Math.imul(ambient, 31) + signatures.ambient) >>> 0;
        }
        return { motion, ambient };
    }
}
