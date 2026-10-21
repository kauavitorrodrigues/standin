type Props = {
    // The emoji just sent, null when there is none to show.
    emoji: string | null;
};

// Floats over the reactions button for a moment after a reaction is sent with
// the bar closed.
export const SentEmoteBadge = ({ emoji }: Props) => {
    if (!emoji) return null;

    return (
        <span
            aria-hidden
            className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-xl animate-in fade-in slide-in-from-bottom-2"
        >
            {emoji}
        </span>
    );
};
