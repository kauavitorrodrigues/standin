import Phaser from "phaser";
import { AvatarTextureRegistry } from "@/features/avatar/lib/AvatarTextureRegistry";
import { buildAvatarSheetUrl } from "@/features/avatar/lib/buildAvatarSheetUrl";
import { AVATAR_FIRST_FRAME } from "@/features/game/consts/avatar-sprite";
import { AvatarSheetBinder } from "@/features/game/lib/AvatarSheetBinder";
import { createSpawnAvatar } from "@/features/editor/lib/createSpawnAvatar";

/**
 * The avatars that stand for the spawns of one editor scene. They wear the
 * sheet of the avatar the person has, and the ghost while there is none or
 * while it loads. One instance serves the scene (see `of`), so the overlay and
 * the previews share the sheet and it is loaded once.
 */
export class SpawnAvatarSheets {
    private static readonly byScene = new WeakMap<
        Phaser.Scene,
        SpawnAvatarSheets
    >();

    private readonly scene: Phaser.Scene;
    private readonly binder: AvatarSheetBinder;
    private readonly sprites = new Map<string, Phaser.GameObjects.Sprite>();
    private fileId: string | null = null;

    private constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.binder = new AvatarSheetBinder(
            new AvatarTextureRegistry(scene, buildAvatarSheetUrl)
        );
    }

    static of(scene: Phaser.Scene): SpawnAvatarSheets {
        const existing = SpawnAvatarSheets.byScene.get(scene);
        if (existing) return existing;

        const sheets = new SpawnAvatarSheets(scene);
        SpawnAvatarSheets.byScene.set(scene, sheets);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            sheets.binder.releaseAll();
            sheets.sprites.clear();
            SpawnAvatarSheets.byScene.delete(scene);
        });
        return sheets;
    }

    /** Puts an avatar with its feet on a point (px). The id is the caller's. */
    place(id: string, x: number, y: number): Phaser.GameObjects.Sprite {
        this.remove(id);
        const sprite = createSpawnAvatar(this.scene, x, y);
        this.sprites.set(id, sprite);
        this.bind(id, sprite);
        return sprite;
    }

    setVisible(id: string, visible: boolean): void {
        this.sprites.get(id)?.setVisible(visible);
    }

    remove(id: string): void {
        const sprite = this.sprites.get(id);
        if (!sprite) return;

        this.binder.release(id);
        sprite.destroy();
        this.sprites.delete(id);
    }

    /** Dresses every avatar with the sheet of the person. Null is the ghost. */
    setFileId(fileId: string | null): void {
        this.fileId = fileId;
        this.sprites.forEach((sprite, id) => this.bind(id, sprite));
    }

    private bind(id: string, sprite: Phaser.GameObjects.Sprite): void {
        this.binder.bind(
            id,
            {
                setTexture: (textureKey) =>
                    sprite.setTexture(textureKey, AVATAR_FIRST_FRAME),
            },
            this.fileId
        );
    }
}
