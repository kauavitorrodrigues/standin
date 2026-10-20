import Phaser from "phaser";
import { AVATAR } from "@standin/contracts";
import {
    AVATAR_OUTLINE,
    AVATAR_OUTLINE_STYLES,
    type AvatarOutlineStyle,
} from "@/features/game/consts/avatar-outline";
import { buildAvatarOutlinePixels } from "@/features/game/utils/buildAvatarOutlinePixels";

const DEFAULT_TEXTURE_KEY = "__DEFAULT";
const ORIGIN_X =
    (AVATAR.anchor.x + AVATAR_OUTLINE.PADDING_PX) /
    (AVATAR.frame.w + AVATAR_OUTLINE.PADDING_PX * 2);
const ORIGIN_Y =
    (AVATAR.anchor.y + AVATAR_OUTLINE.PADDING_PX) /
    (AVATAR.frame.h + AVATAR_OUTLINE.PADDING_PX * 2);

// The outline of an avatar sprite and its body shifted to blue, both traced
// on the pixels of the frame it shows right now, so it follows every step of
// the walk. It draws over the sprite, which its opaque pixels cover. Each frame
// is built the first time it is seen and kept, one tiny texture each.
export class AvatarOutline {
    private readonly scene: Phaser.Scene;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly image: Phaser.GameObjects.Image;
    // Keyed by the source image of the sheet, so a sheet that is replaced
    // starts over, and then by the frame.
    private readonly built = new WeakMap<object, Map<string, string>>();
    private readonly styles = new WeakMap<object, AvatarOutlineStyle>();
    private builtCount = 0;

    constructor(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
        this.scene = scene;
        this.sprite = sprite;
        this.image = scene.add
            .image(sprite.x, sprite.y, DEFAULT_TEXTURE_KEY)
            .setVisible(false)
            .setOrigin(ORIGIN_X, ORIGIN_Y);
        scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncTransform);
    }

    // Called every frame, shown or not.
    update(isVisible: boolean): void {
        const style = this.resolveStyle();
        const textureKey = isVisible ? this.resolveOutlineTexture(style) : null;
        // In the full style the image draws the whole avatar, so the sprite
        // steps aside and the see-through body is not drawn twice.
        const isReplaced =
            textureKey !== null && style === AVATAR_OUTLINE_STYLES.FULL;
        this.sprite.setVisible(!isReplaced);
        if (!textureKey) {
            this.image.setVisible(false);
            return;
        }

        this.image.setTexture(textureKey).setVisible(true);
        this.syncTransform();
    }

    destroy(): void {
        this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncTransform);
        this.sprite.setVisible(true);
        this.image.destroy();
    }

    // The physics moves the sprite after the scene update, so the image copies
    // the position again once that is done. Otherwise it trails the sprite by
    // one frame while the avatar walks, which shows as a ghost.
    private readonly syncTransform = (): void => {
        this.image
            .setPosition(this.sprite.x, this.sprite.y)
            .setFlipX(this.sprite.flipX)
            .setDepth(this.sprite.depth + AVATAR_OUTLINE.DEPTH_ABOVE_AVATAR);
    };

    // An avatar with no skin, the ghost or a bare body, is a couple of flat
    // colors and gets the full look. One with a skin keeps its own colors and
    // only gets the ring. It is read from the whole sheet, once, so it stays
    // the same through every frame of the walk.
    private resolveStyle(): AvatarOutlineStyle {
        const sourceImage = this.sprite.frame.texture.getSourceImage() as
            HTMLImageElement | HTMLCanvasElement;
        const known = this.styles.get(sourceImage);
        if (known) return known;

        const style = this.readSheetStyle(sourceImage);
        this.styles.set(sourceImage, style);
        return style;
    }

    private readSheetStyle(
        sourceImage: HTMLImageElement | HTMLCanvasElement
    ): AvatarOutlineStyle {
        const reader = document.createElement("canvas");
        reader.width = sourceImage.width;
        reader.height = sourceImage.height;
        const context = reader.getContext("2d", { willReadFrequently: true });
        if (!context) return AVATAR_OUTLINE_STYLES.RING_ONLY;

        context.drawImage(sourceImage, 0, 0);
        const { data } = context.getImageData(
            0,
            0,
            reader.width,
            reader.height
        );
        const colors = new Set<number>();
        for (let at = 0; at < data.length; at += 4) {
            if (data[at + 3]! < AVATAR_OUTLINE.BODY_ALPHA_THRESHOLD) continue;

            colors.add(
                (data[at]! << 16) | (data[at + 1]! << 8) | data[at + 2]!
            );
            if (colors.size > AVATAR_OUTLINE.FULL_STYLE_MAX_COLORS) {
                return AVATAR_OUTLINE_STYLES.RING_ONLY;
            }
        }
        return AVATAR_OUTLINE_STYLES.FULL;
    }

    private resolveOutlineTexture(style: AvatarOutlineStyle): string | null {
        const { frame } = this.sprite;
        const sourceImage = frame.texture.getSourceImage() as
            HTMLImageElement | HTMLCanvasElement;
        let frames = this.built.get(sourceImage);
        if (!frames) {
            frames = new Map();
            this.built.set(sourceImage, frames);
        }

        const frameName = `${style}:${frame.name}`;
        const known = frames.get(frameName);
        if (known) return known;

        const key = `${AVATAR_OUTLINE.TEXTURE_KEY_PREFIX}:${this.builtCount++}`;
        if (!this.buildTexture(key, frame, sourceImage, style)) return null;

        frames.set(frameName, key);
        return key;
    }

    private buildTexture(
        key: string,
        frame: Phaser.Textures.Frame,
        sourceImage: HTMLImageElement | HTMLCanvasElement,
        style: AvatarOutlineStyle
    ): boolean {
        const { cutX, cutY, cutWidth, cutHeight } = frame;
        const reader = document.createElement("canvas");
        reader.width = cutWidth;
        reader.height = cutHeight;
        const readerContext = reader.getContext("2d", {
            willReadFrequently: true,
        });
        if (!readerContext) return false;

        readerContext.drawImage(
            sourceImage,
            cutX,
            cutY,
            cutWidth,
            cutHeight,
            0,
            0,
            cutWidth,
            cutHeight
        );
        const { pixels, width, height } = buildAvatarOutlinePixels(
            readerContext.getImageData(0, 0, cutWidth, cutHeight).data,
            cutWidth,
            cutHeight,
            style
        );

        const texture = this.scene.textures.createCanvas(key, width, height);
        if (!texture) return false;

        texture.context.putImageData(
            new ImageData(new Uint8ClampedArray(pixels), width, height),
            0,
            0
        );
        texture.refresh();
        return true;
    }
}
