import { recordMessagesSeenBy } from "./recordSeenBy";
import { listSeenBy } from "./listSeenBy";

export const MessageReadService = {
    recordSeenBy: recordMessagesSeenBy,
    listSeenBy,
};
