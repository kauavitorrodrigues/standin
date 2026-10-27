import type Phaser from "phaser";
import {
    NAME_TAG,
    NAME_TAG_LAYERS,
    type NameTagLayer,
} from "@/features/game/consts/name-tag";
import { NameTagOverlay } from "@/features/game/lib/NameTagOverlay";
import { getNameTagPosition } from "@/features/game/utils/getNameTagPosition";

type Params = {
    scene: Phaser.Scene;
    isLocal: boolean;
    // The sprite of the avatar. Its position is the feet the tag follows.
    target: { x: number; y: number };
};

// Who the tag is of, for the photo it shows when it is clicked.
type Profile = {
    userId: string;
    profilePictureUrl: string | null;
};

// The name over an avatar. It is placed over the feet it follows, with its
// bottom center on the point `getNameTagPosition` gives.
export class NameTag {
    private readonly overlay: NameTagOverlay;
    private readonly id: number;
    private readonly baseLayer: NameTagLayer;
    private layer: NameTagLayer;
    private lastFeetY = 0;
    private name = "";
    private isAllowed = true;
    private isTyping = false;

    constructor({ scene, isLocal, target }: Params) {
        this.baseLayer = isLocal
            ? NAME_TAG_LAYERS.LOCAL
            : NAME_TAG_LAYERS.OTHER;
        this.layer = this.baseLayer;
        this.overlay = NameTagOverlay.forScene(scene);
        this.id = this.overlay.add({
            props: {
                name: "",
                isLocal,
                isDetailed: false,
                userId: "",
                profilePictureUrl: null,
            },
            source: () => this.locate(target),
        });
    }

    get hasName(): boolean {
        return this.name !== "";
    }

    // Whether the tag is on the screen: it has a name and the rules allow it.
    get isShown(): boolean {
        return this.isAllowed && this.hasName;
    }

    setName(name: string): void {
        this.name = name.trim();
        this.refreshVisibility();
    }

    setProfile({ userId, profilePictureUrl }: Profile): void {
        this.overlay.setProps(this.id, { userId, profilePictureUrl });
    }

    // The chat icon in place of the dot, while a nearby message is written.
    setTyping(isTyping: boolean): void {
        // Called for every avatar on every frame, so an unchanged value must
        // not build a props object.
        if (isTyping === this.isTyping) return;

        this.isTyping = isTyping;
        this.overlay.setProps(this.id, { isTyping });
    }

    // The tag was clicked: the photo shows, it glows, and it draws over the
    // other tags.
    setDetailed(isDetailed: boolean): void {
        this.layer = isDetailed ? NAME_TAG_LAYERS.SELECTED : this.baseLayer;
        this.overlay.setProps(this.id, { isDetailed });
        this.applyZIndex(this.lastFeetY);
    }

    // The rules of `shouldShowNameTag`, decided by the scene.
    setAllowed(isAllowed: boolean): void {
        if (isAllowed === this.isAllowed) return;

        this.isAllowed = isAllowed;
        this.refreshVisibility();
    }

    destroy(): void {
        this.overlay.remove(this.id);
    }

    // Called when the tag is drawn, with the feet of the avatar as they are
    // drawn. The tag of an avatar lower on the map draws over the ones behind
    // it, inside its layer.
    private locate(feet: { x: number; y: number }): { x: number; y: number } {
        this.applyZIndex(feet.y);
        return getNameTagPosition(feet);
    }

    private applyZIndex(feetY: number): void {
        this.lastFeetY = feetY;
        this.overlay.setZIndex(
            this.id,
            this.layer * NAME_TAG.Z_INDEX_PER_LAYER +
                Math.min(
                    Math.max(Math.round(feetY), 0),
                    NAME_TAG.Z_INDEX_PER_LAYER - 1
                )
        );
    }

    // A tag that is not shown holds no name at all, so a name the rules hide is
    // not sitting in the page either.
    private refreshVisibility(): void {
        this.overlay.setProps(this.id, {
            name: this.isShown ? this.name : "",
        });
        this.overlay.setShown(this.id, this.isShown);
    }
}
