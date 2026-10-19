import Phaser from "phaser";
import { AVATAR_HIGHLIGHT } from "@/features/game/consts/avatar-hover";
import { AvatarOutlineFXPipeline } from "@/features/game/lib/AvatarOutlineFXPipeline";

// The outline of an avatar sprite, along its shape. The pipeline is on the
// sprite only while the highlight is on, so a sprite at rest draws as any
// other. It needs WebGL: on another renderer it does nothing.
export class AvatarHighlight {
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly isSupported: boolean;
    private isOn = false;

    constructor(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
        this.sprite = sprite;
        const { renderer } = scene;
        if (!(renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer)) {
            this.isSupported = false;
            return;
        }

        this.isSupported = true;
        const { pipelines } = renderer;
        if (pipelines.getPostPipeline(AVATAR_HIGHLIGHT.PIPELINE_KEY)) return;

        pipelines.addPostPipeline(
            AVATAR_HIGHLIGHT.PIPELINE_KEY,
            AvatarOutlineFXPipeline
        );
    }

    setOn(isOn: boolean): void {
        if (!this.isSupported || isOn === this.isOn) return;

        this.isOn = isOn;
        if (isOn) {
            this.sprite.setPostPipeline(AVATAR_HIGHLIGHT.PIPELINE_KEY);
            return;
        }
        this.sprite.resetPostPipeline(true);
    }
}
