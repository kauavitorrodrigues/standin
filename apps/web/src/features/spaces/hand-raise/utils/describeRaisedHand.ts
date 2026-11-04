import type { RaisedHandPerson } from "../types/handRaise";
import { HAND_RAISE_TOAST_TEXTS } from "../consts/handRaiseToast";

// The toast for a hand that just went up: the person, with their avatar, and
// what they did. Someone whose name is not known still gets a toast.
export const describeRaisedHand = (
    userId: string,
    person: RaisedHandPerson | undefined
) => ({
    title: person?.name ?? HAND_RAISE_TOAST_TEXTS.unknownName,
    description: HAND_RAISE_TOAST_TEXTS.suffix,
    type: "info" as const,
    data: {
        avatar: {
            id: userId,
            name: person?.name ?? HAND_RAISE_TOAST_TEXTS.unknownName,
            src: person?.profilePictureUrl ?? null,
        },
    },
});
