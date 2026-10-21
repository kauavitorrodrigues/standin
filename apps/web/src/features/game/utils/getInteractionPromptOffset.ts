import { AVATAR } from "@standin/contracts";
import { INTERACTION_PROMPT_GAP_PX } from "@/features/game/consts/interaction";
import {
    NAME_TAG,
    NAME_TAG_TOTAL_HEIGHT,
} from "@/features/game/consts/name-tag";

// From the feet of the avatar up to the bottom of the prompt, in world px. The
// prompt sits over the name tag. The tag keeps its size on the screen, so what
// it takes of the world shrinks as the zoom grows: 28 screen px are 56 world
// px at zoom 0.5 and 7 at zoom 4. Counting them as world px would put the
// prompt under the tag when zoomed out and far over it when zoomed in.
export const getInteractionPromptOffset = (
    zoom: number,
    scalesWithZoom: boolean = NAME_TAG.SCALES_WITH_ZOOM
): number => {
    const tagHeight =
        scalesWithZoom || zoom <= 0
            ? NAME_TAG_TOTAL_HEIGHT
            : NAME_TAG_TOTAL_HEIGHT / zoom;

    return (
        AVATAR.visible.h +
        AVATAR.nameTagGap +
        tagHeight +
        INTERACTION_PROMPT_GAP_PX
    );
};
