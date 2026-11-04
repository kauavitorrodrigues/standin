import { useEffect, useRef } from "react";
import type { SpaceRaisedHand } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import type { RaisedHandPerson } from "../types/handRaise";
import { describeRaisedHand } from "../utils/describeRaisedHand";
import { findNewHands } from "../utils/findNewHands";

type Options = {
    hands: readonly SpaceRaisedHand[];
    personOf: (userId: string) => RaisedHandPerson | undefined;
};

// Tells me who just raised a hand near me, so I know they want to speak. Only
// a hand that is new in the list counts, never the ones already up.
export function useHandRaiseToasts({ hands, personOf }: Options) {
    const previousRef = useRef<readonly SpaceRaisedHand[]>([]);

    useEffect(() => {
        findNewHands(previousRef.current, hands).forEach((hand) =>
            toast.add(describeRaisedHand(hand.userId, personOf(hand.userId)))
        );
        previousRef.current = hands;
    }, [hands, personOf]);
}
