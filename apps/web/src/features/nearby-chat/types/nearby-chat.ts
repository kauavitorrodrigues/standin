import type { NearbyMessageStore } from "@/features/game/lib/NearbyMessageStore";

// What the nearby chat needs from the page: the store that the map and the
// panel share, and the two ways out to the mesh. Built once by the page.
export type NearbyChatConnection = {
    store: NearbyMessageStore;
    sendMessage: (text: string) => void;
    sendTyping: (isTyping: boolean) => void;
};

// What the button of the bar needs from the panel.
export type NearbyChatButtonState = {
    isOpen: boolean;
    onToggle: () => void;
};

export type NearbyCounter = {
    length: number;
    // The header shows "N/50" instead of the title.
    isVisible: boolean;
    // From 40 characters the counter takes the warning color.
    isWarning: boolean;
    // Past 50 and not a link, so it cannot be sent.
    isOverLimit: boolean;
};
