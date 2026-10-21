import type Phaser from "phaser";
import {
    NAME_TAG,
    NAME_TAG_TOTAL_HEIGHT,
} from "@/features/game/consts/name-tag";
import { NEARBY_BUBBLE } from "@/features/game/consts/nearby";
import {
    NearbyBubbleStack,
    type NearbyBubbleStackProps,
} from "@/features/game/components/NearbyBubbleStack";
import { ReactDomElement } from "@/features/game/lib/ReactDomElement";
import type { NearbyMessageStore } from "@/features/game/lib/NearbyMessageStore";
import { getNameTagPosition } from "@/features/game/utils/getNameTagPosition";
import { getNearbyColor } from "@/features/game/utils/getNearbyColor";

// Where a person is for the bubble: the feet of the avatar and whether the
// rules let the name tag show.
export type NearbyAnchor = {
    feet: { x: number; y: number };
    isAllowed: boolean;
};

type Params = {
    scene: Phaser.Scene;
    store: NearbyMessageStore;
    // Null when the person has no avatar in the scene.
    resolveAnchor: (userId: string) => NearbyAnchor | null;
};

type Bubble = {
    element: ReactDomElement<NearbyBubbleStackProps>;
};

// The bubbles over the avatars: one DOM element per person with a message or
// the dots, made on demand and let go when it empties, like the name tag. It
// sits over the name tag, and it does not leave when the person walks out of
// range, it lasts until its own timeout.
export class NearbyBubbles {
    private readonly scene: Phaser.Scene;
    private readonly store: NearbyMessageStore;
    private readonly resolveAnchor: Params["resolveAnchor"];
    private readonly bubbles = new Map<string, Bubble>();
    private readonly unsubscribe: () => void;
    private isDirty = true;

    constructor({ scene, store, resolveAnchor }: Params) {
        this.scene = scene;
        this.store = store;
        this.resolveAnchor = resolveAnchor;
        this.unsubscribe = store.subscribe(() => {
            this.isDirty = true;
        });
    }

    // Called every frame. The content is rebuilt only when the store changed,
    // and the visibility follows the rules of the name tag all the time.
    update(): void {
        if (this.isDirty) {
            this.isDirty = false;
            this.syncContent();
        }

        this.bubbles.forEach((bubble, userId) => {
            const anchor = this.resolveAnchor(userId);
            if (!anchor) {
                this.release(userId);
                return;
            }
            bubble.element.setShown(anchor.isAllowed);
        });
    }

    destroy(): void {
        this.unsubscribe();
        [...this.bubbles.keys()].forEach((userId) => this.release(userId));
    }

    private syncContent(): void {
        const userIds = this.store.getBubbleUserIds();

        this.bubbles.forEach((_bubble, userId) => {
            if (!userIds.has(userId)) this.release(userId);
        });

        userIds.forEach((userId) => {
            const bubble = this.bubbles.get(userId) ?? this.create(userId);
            if (!bubble) return;

            bubble.element.setProps(this.buildProps(userId));
        });
    }

    private buildProps(userId: string): NearbyBubbleStackProps {
        return {
            // The store gives the newest first, the stack draws it last.
            lines: this.store
                .getForMap(userId)
                .reverse()
                .map(({ message, opacity }) => ({
                    id: message.id,
                    text: message.text,
                    opacity,
                })),
            color: getNearbyColor(userId),
        };
    }

    private create(userId: string): Bubble | null {
        if (!this.resolveAnchor(userId)) return null;

        const element = new ReactDomElement<NearbyBubbleStackProps>(
            this.scene,
            0,
            0,
            NearbyBubbleStack,
            { lines: [], color: getNearbyColor(userId) },
            { scalesWithZoom: NAME_TAG.SCALES_WITH_ZOOM }
        )
            .setOrigin(0.5, 1)
            .setShown(false)
            .setZIndex(NEARBY_BUBBLE.Z_INDEX)
            .setPositionSource(() => this.locate(userId));
        const bubble = { element };
        this.bubbles.set(userId, bubble);
        return bubble;
    }

    private release(userId: string): void {
        this.bubbles.get(userId)?.element.destroy();
        this.bubbles.delete(userId);
    }

    // The bottom center of the stack: over the top of the name tag, with the
    // gap between them. The tag keeps its size on the screen, so its height is
    // taken off the world by the zoom.
    private locate(userId: string): { x: number; y: number } {
        const feet = this.resolveAnchor(userId)?.feet ?? { x: 0, y: 0 };
        const { x, y } = getNameTagPosition(feet);
        const zoom = NAME_TAG.SCALES_WITH_ZOOM
            ? 1
            : this.scene.cameras.main.zoom;

        return {
            x,
            y: y - (NAME_TAG_TOTAL_HEIGHT + NEARBY_BUBBLE.GAP) / zoom,
        };
    }
}
