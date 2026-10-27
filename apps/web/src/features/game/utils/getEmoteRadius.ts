import {
    SPACE_EVENT_RADIUS_PX,
    type ProximityPreset,
} from "@standin/contracts";
import { EMOTE_REACH_FACTOR } from "@/features/game/consts/emote";
import { getProximityRadii } from "@/features/game/multiplayer/utils/proximityRadii";

/**
 * The reach of an emote in px: a little farther than the voice of the space,
 * but never past the radius the server sends events to, since beyond it nothing
 * arrives.
 */
export const getEmoteRadius = (preset: ProximityPreset): number =>
    Math.min(
        getProximityRadii(preset).enterRadius * EMOTE_REACH_FACTOR,
        SPACE_EVENT_RADIUS_PX
    );
