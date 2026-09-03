import type { ConversationMessagesListResponse } from "@standin/contracts";

// How close to the top of the viewport the user has to scroll before the
// previous page of messages starts loading.
export const LOAD_MORE_SCROLL_THRESHOLD_PX = 200;

export const MESSAGE_TIME_FORMAT = "HH:mm";

// Marks a message that only exists locally while its request is in flight,
// so the server response can replace exactly that entry afterwards.
export const OPTIMISTIC_MESSAGE_ID_PREFIX = "optimistic-";

export const EMPTY_MESSAGES_PAGE: ConversationMessagesListResponse = {
    messages: [],
    users: {},
    nextCursor: null,
};
