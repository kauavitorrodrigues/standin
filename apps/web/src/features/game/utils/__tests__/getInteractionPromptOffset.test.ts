import { describe, expect, it } from "vitest";
import { AVATAR } from "@standin/contracts";
import { INTERACTION_PROMPT_GAP_PX } from "@/features/game/consts/interaction";
import { NAME_TAG_TOTAL_HEIGHT } from "@/features/game/consts/name-tag";
import { getInteractionPromptOffset } from "../getInteractionPromptOffset";

const BODY = AVATAR.visible.h + AVATAR.nameTagGap + INTERACTION_PROMPT_GAP_PX;

describe("getInteractionPromptOffset", () => {
    it("counts the tag in screen px when it keeps its size on the screen", () => {
        expect(getInteractionPromptOffset(1, false)).toBe(
            BODY + NAME_TAG_TOTAL_HEIGHT
        );
        expect(getInteractionPromptOffset(4, false)).toBe(
            BODY + NAME_TAG_TOTAL_HEIGHT / 4
        );
        expect(getInteractionPromptOffset(0.5, false)).toBe(
            BODY + NAME_TAG_TOTAL_HEIGHT * 2
        );
    });

    it("clears the tag at every zoom, so the prompt is never under it", () => {
        [0.5, 1, 2, 4].forEach((zoom) => {
            const tagTopInWorld =
                AVATAR.visible.h +
                AVATAR.nameTagGap +
                NAME_TAG_TOTAL_HEIGHT / zoom;

            expect(getInteractionPromptOffset(zoom, false)).toBeGreaterThan(
                tagTopInWorld
            );
        });
    });

    it("counts the tag in world px when it scales with the zoom", () => {
        expect(getInteractionPromptOffset(4, true)).toBe(
            BODY + NAME_TAG_TOTAL_HEIGHT
        );
    });

    it("falls back to the world size for a zoom that is not positive", () => {
        expect(getInteractionPromptOffset(0, false)).toBe(
            BODY + NAME_TAG_TOTAL_HEIGHT
        );
    });
});
