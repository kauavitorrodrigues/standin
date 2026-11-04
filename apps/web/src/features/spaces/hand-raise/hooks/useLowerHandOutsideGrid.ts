import { useEffect } from "react";
import type { SpaceHandRaise } from "../types/handRaise";
import { shouldAutoLowerHand } from "../utils/shouldAutoLowerHand";

type Options = {
    handRaise: SpaceHandRaise;
    isGridView: boolean;
};

// A hand only means something in the view of all participants, so it goes down
// when the person leaves that view.
export function useLowerHandOutsideGrid({ handRaise, isGridView }: Options) {
    const { isRaised, lower } = handRaise;

    useEffect(() => {
        if (!shouldAutoLowerHand({ isGridView, isRaised })) return;

        lower();
    }, [isGridView, isRaised, lower]);
}
