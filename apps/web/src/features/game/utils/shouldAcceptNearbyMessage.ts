import { isValidNearbyText } from "@/features/game/utils/isValidNearbyText";

type Params = {
    text: unknown;
    // The distance the receiver measured to the sender, which is Infinity when
    // they are not in the same private room.
    distance: number;
    radius: number;
    // Asked last, since it counts the message against the sender.
    isRateAllowed: () => boolean;
};

// The rules of a nearby message that comes from a peer, which is never
// trusted: the text must be valid, the sender must be inside the radius and
// the same room, and under the rate limit.
export const shouldAcceptNearbyMessage = ({
    text,
    distance,
    radius,
    isRateAllowed,
}: Params): boolean => {
    if (!isValidNearbyText(text)) return false;
    if (distance > radius) return false;

    return isRateAllowed();
};
