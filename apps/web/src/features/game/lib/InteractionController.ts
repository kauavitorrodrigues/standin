import Phaser from "phaser";
import { INTERACTION_PROMPT_STYLE } from "@/features/game/consts/interaction";
import { PLAYER_INTERACT_KEY } from "@/features/game/consts/player";
import {
    resolveActionTarget,
    resolveInteractionPromptLabel,
    type InteractableMapObjectProperties,
} from "@/features/game/utils/player";
import type { Player } from "@/features/game/lib/Player";

export class InteractionController {
    private readonly player: Player;
    private readonly interactKey: Phaser.Input.Keyboard.Key | null;
    private readonly promptText: Phaser.GameObjects.Text;
    private activeProperties: InteractableMapObjectProperties | null = null;
    private pendingProperties: InteractableMapObjectProperties | null = null;

    constructor(scene: Phaser.Scene, player: Player) {
        this.player = player;
        this.interactKey =
            scene.input.keyboard?.addKey(PLAYER_INTERACT_KEY) ?? null;
        this.promptText = scene.add
            .text(
                INTERACTION_PROMPT_STYLE.INITIAL_POSITION,
                INTERACTION_PROMPT_STYLE.INITIAL_POSITION,
                "",
                {
                    fontSize: INTERACTION_PROMPT_STYLE.FONT_SIZE,
                    fontFamily: INTERACTION_PROMPT_STYLE.FONT_FAMILY,
                    color: INTERACTION_PROMPT_STYLE.COLOR,
                    backgroundColor: INTERACTION_PROMPT_STYLE.BACKGROUND_COLOR,
                    padding: {
                        x: INTERACTION_PROMPT_STYLE.PADDING_X,
                        y: INTERACTION_PROMPT_STYLE.PADDING_Y,
                    },
                }
            )
            .setOrigin(
                INTERACTION_PROMPT_STYLE.ORIGIN_X,
                INTERACTION_PROMPT_STYLE.ORIGIN_Y_BOTTOM
            )
            .setDepth(INTERACTION_PROMPT_STYLE.DEPTH)
            .setVisible(false);
    }

    registerOverlap(properties: InteractableMapObjectProperties): void {
        this.pendingProperties = properties;
    }

    update(): void {
        this.syncActiveZone();
        this.positionPrompt();
        this.handleInteractKey();
    }

    private syncActiveZone(): void {
        if (this.pendingProperties === this.activeProperties) {
            this.pendingProperties = null;
            return;
        }

        this.activeProperties = this.pendingProperties;
        this.pendingProperties = null;
        this.refreshPrompt();
    }

    private refreshPrompt(): void {
        if (!this.activeProperties) {
            this.promptText.setVisible(false);
            return;
        }

        this.promptText.setText(
            resolveInteractionPromptLabel(this.activeProperties.action)
        );
        this.promptText.setVisible(true);
    }

    private positionPrompt(): void {
        this.promptText.setPosition(
            this.player.x,
            this.player.y - INTERACTION_PROMPT_STYLE.ABOVE_PLAYER_OFFSET
        );
    }

    private handleInteractKey(): void {
        if (!this.interactKey || !this.activeProperties) return;
        if (!Phaser.Input.Keyboard.JustDown(this.interactKey)) return;

        const target = resolveActionTarget(this.activeProperties);
        this.player.teleportTo(target.x, target.y);
    }
}
