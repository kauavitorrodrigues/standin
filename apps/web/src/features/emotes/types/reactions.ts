// What the reactions button needs from the reactions state.
export type ReactionsButtonState = {
    isOpen: boolean;
    onToggle: () => void;
    // The emoji just sent, to float over the button for a moment.
    sentEmoji: string | null;
};
