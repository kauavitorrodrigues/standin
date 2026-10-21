import type { FormEvent } from "react";
import { NearbyChatTextField } from "@/features/nearby-chat/components/fields/NearbyChatTextField";
import { NearbyChatFooter } from "@/features/nearby-chat/components/views/NearbyChatFooter";
import type { useNearbyComposer } from "@/features/nearby-chat/hooks/useNearbyComposer";

type Props = {
    composer: ReturnType<typeof useNearbyComposer>;
    isOpen: boolean;
};

// The field and the footer. Enter sends the text, and the event stops here so
// it never reaches the game.
export const NearbyChatForm = ({ composer, isOpen }: Props) => {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.stopPropagation();
        void composer.submit(event);
    };

    return (
        <form onSubmit={handleSubmit} className="px-1.5 pt-1.5 pb-1">
            <NearbyChatTextField
                control={composer.control}
                isOpen={isOpen}
                onFocus={composer.startTyping}
                onBlur={composer.stopTyping}
            />
            <NearbyChatFooter hasText={composer.hasText} />
        </form>
    );
};
