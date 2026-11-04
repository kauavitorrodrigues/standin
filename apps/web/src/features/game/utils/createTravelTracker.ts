import type { TravelTracker } from "@/features/game/types/travel";

type Params = {
    minDistance: number;
    maxStep: number;
};

// Adds up the distance the avatar walks, frame by frame. The first position is
// only the start, and a jump past `maxStep` is skipped, so entering the map or
// being placed somewhere does not count as walking.
export const createTravelTracker = ({
    minDistance,
    maxStep,
}: Params): TravelTracker => {
    let last: { x: number; y: number } | null = null;
    let total = 0;
    let isDone = false;

    return {
        update: (x, y) => {
            if (isDone) return false;

            const previous = last;
            last = { x, y };
            if (previous === null) return false;

            const step = Math.hypot(x - previous.x, y - previous.y);
            if (step > maxStep) return false;

            total += step;
            if (total < minDistance) return false;

            isDone = true;
            return true;
        },
    };
};
