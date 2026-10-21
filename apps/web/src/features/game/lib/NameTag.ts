import type Phaser from "phaser";
import {
    NAME_TAG,
    NAME_TAG_LAYERS,
    type NameTagLayer,
} from "@/features/game/consts/name-tag";
import {
    NameTagPill,
    type NameTagPillProps,
} from "@/features/game/components/NameTagPill";
import { ReactDomElement } from "@/features/game/lib/ReactDomElement";
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
    private readonly element: ReactDomElement<NameTagPillProps>;
    private readonly baseLayer: NameTagLayer;
    private layer: NameTagLayer;
    private lastFeetY = 0;
    private name = "";
    private isAllowed = true;

    constructor({ scene, isLocal, target }: Params) {
        this.baseLayer = isLocal
            ? NAME_TAG_LAYERS.LOCAL
            : NAME_TAG_LAYERS.OTHER;
        this.layer = this.baseLayer;
        this.element = new ReactDomElement<NameTagPillProps>(
            scene,
            0,
            0,
            NameTagPill,
            {
                name: "",
                isLocal,
                isDetailed: false,
                userId: "",
                profilePictureUrl: null,
            },
            { scalesWithZoom: NAME_TAG.SCALES_WITH_ZOOM }
        )
            .setOrigin(0.5, 1)
            .setShown(false)
            .setPositionSource(() => this.locate(target));
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
        this.element.setProps({ userId, profilePictureUrl });
    }

    // The chat icon in place of the dot, while a nearby message is written.
    setTyping(isTyping: boolean): void {
        this.element.setProps({ isTyping });
    }

    // The tag was clicked: the photo shows, it glows, and it draws over the
    // other tags.
    setDetailed(isDetailed: boolean): void {
        this.layer = isDetailed ? NAME_TAG_LAYERS.SELECTED : this.baseLayer;
        this.element.setProps({ isDetailed });
        this.applyZIndex(this.lastFeetY);
    }

    // The rules of `shouldShowNameTag`, decided by the scene.
    setAllowed(isAllowed: boolean): void {
        if (isAllowed === this.isAllowed) return;

        this.isAllowed = isAllowed;
        this.refreshVisibility();
    }

    destroy(): void {
        this.element.destroy();
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
        this.element.setZIndex(
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
        this.element.setProps({ name: this.isShown ? this.name : "" });
        this.element.setShown(this.isShown);
    }
}
