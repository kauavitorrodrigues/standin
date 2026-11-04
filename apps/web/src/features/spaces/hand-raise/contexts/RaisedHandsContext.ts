import { createContext, useContext } from "react";

// The people with a hand up, by user id, mine included. The stage provides it,
// so the tiles of the strip and of the full view get it without each level
// passing it down. Without a provider nobody has a hand up.
const NO_HANDS: ReadonlySet<string> = new Set();

export const RaisedHandsContext = createContext<ReadonlySet<string>>(NO_HANDS);

export const useRaisedHandUserIds = (): ReadonlySet<string> =>
    useContext(RaisedHandsContext);
