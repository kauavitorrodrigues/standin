import Phaser from "phaser";
import type { EditorModel } from "@standin/contracts";
import { MAP_CURSORS } from "@/features/game/consts/camera";
import { DECORATOR_DESK_MESSAGES } from "@/features/game/consts/decorator-messages";
import { createSceneObjectSurface } from "@/features/editor/utils/createSceneObjectSurface";
import { hitTestObjects } from "@/features/editor/utils/hitTestObjects";
import { findOtherDeskClaim } from "@/features/game/utils/findOtherDeskClaim";

const BLOCKED_CURSOR = "not-allowed";

type Params = {
    scene: Phaser.Scene;
    userId: string;
    getModel: () => Readonly<EditorModel>;
    getUserName: (userId: string) => string | null;
    onHint: (text: string | null) => void;
};

// While the mouse is over a desk claimed by someone else, or an item on it,
// the cursor says blocked and the hint line says whose desk it is. Those
// objects cannot be selected, so nothing else answers the mouse there. It
// writes the hint only when the mouse goes in or out, so it never competes
// with the hint of a tool that is running.
export class DeskLockHover {
    private readonly params: Params;
    private owner: string | null = null;

    constructor(params: Params) {
        this.params = params;
        const { input } = params.scene;
        input.on(Phaser.Input.Events.POINTER_MOVE, this.handleMove);
        input.on(Phaser.Input.Events.GAME_OUT, this.clear);
    }

    destroy(): void {
        const { input } = this.params.scene;
        input.off(Phaser.Input.Events.POINTER_MOVE, this.handleMove);
        input.off(Phaser.Input.Events.GAME_OUT, this.clear);
        this.clear();
    }

    private handleMove = (pointer: Phaser.Input.Pointer): void => {
        const { scene, userId, getModel, getUserName } = this.params;
        const world = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const model = getModel();
        const target = hitTestObjects({
            model,
            worldX: world.x,
            worldY: world.y,
            surface: createSceneObjectSurface(scene),
        });
        const claim = target && findOtherDeskClaim(model, target.id, userId);
        if (!claim) {
            this.clear();
            return;
        }

        const owner =
            getUserName(claim.userId) || DECORATOR_DESK_MESSAGES.UNKNOWN_OWNER;
        this.show(owner);
    };

    // The cursor is written on every move, because the hover of the select
    // tool writes its own on every move too. The hint only when the owner
    // changes.
    private show(owner: string): void {
        this.params.scene.game.canvas.style.cursor = BLOCKED_CURSOR;
        if (owner === this.owner) return;

        this.owner = owner;
        this.params.onHint(DECORATOR_DESK_MESSAGES.deskOf(owner));
    }

    private clear = (): void => {
        if (this.owner === null) return;

        this.owner = null;
        this.params.scene.game.canvas.style.cursor = MAP_CURSORS.IDLE;
        this.params.onHint(null);
    };
}
