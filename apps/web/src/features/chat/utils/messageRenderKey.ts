import type { MessageWithDetails } from "@standin/contracts";

// A message swapped in later via a CONFIRM broadcast keeps its original
// tempId attached, purely client-side, so this can return the same identity
// before and after the swap even though `message.id` changes from the
// temporary id to the real one. A plain refetch of the same message from
// the API returns it without a tempId, so this alone doesn't survive a
// refetch boundary; groupMessagesBySender additionally indexes by plain id
// for that case.
type MessageWithTempId = MessageWithDetails & { tempId?: string };

// The identity a message should render under, independent of a real id
// arriving later than the message itself. Used anywhere a list needs a
// React key that survives a temp id being swapped for the real one, so that
// swap doesn't get mistaken for the row being removed and a new one added.
export const messageRenderKey = (message: MessageWithDetails): string =>
    (message as MessageWithTempId).tempId ?? message.id;
