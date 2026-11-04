import type { SpaceRaisedHand } from "@standin/contracts";

export type HandRaiseState = {
    // The hands near me, exactly as the server sent them. The server decides
    // who is within earshot and the order, the client only shows it.
    hands: SpaceRaisedHand[];
    // When my own hand went up, null while it is down.
    raisedSince: number | null;
};

export type HandRaiseAction =
    | { type: "hands-received"; hands: SpaceRaisedHand[] }
    | { type: "own-state-set"; raisedSince: number | null }
    | { type: "reset" };

export type HandRaiseRequestKind = "raise" | "lower";

export type SpaceHandRaise = {
    // The hands of the people near me, not mine.
    hands: SpaceRaisedHand[];
    isRaised: boolean;
    raise: () => void;
    lower: () => void;
};

export type AutoLowerHandInput = {
    isGridView: boolean;
    isRaised: boolean;
};

// Who a raised hand belongs to, for the toast that announces it.
export type RaisedHandPerson = {
    id: string;
    name: string;
    profilePictureUrl: string | null;
};
