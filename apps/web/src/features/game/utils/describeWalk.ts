import { WALK_MESSAGES } from "@/features/game/consts/walk-messages";
import type { WalkPurpose } from "@/features/game/types/walk";

// The text of the chip for a walk. A person with no known name gets the plain
// wording.
export const describeWalk = (
    purpose: WalkPurpose,
    getName: (userId: string) => string | undefined
): string => {
    switch (purpose.kind) {
        case "desk":
            return WALK_MESSAGES.toDesk;
        case "person": {
            const name = getName(purpose.userId);
            return name
                ? WALK_MESSAGES.toPerson(name)
                : WALK_MESSAGES.toSomeone;
        }
        case "tile":
            return WALK_MESSAGES.toTile;
    }
};
