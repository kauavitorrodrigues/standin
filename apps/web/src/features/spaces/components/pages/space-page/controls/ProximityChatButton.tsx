import { MessageCircleIcon } from "lucide-react";
import { ControlButton } from "@/components/ControlButton";

type Props = {
    // Talking to whoever is nearby only makes sense on the office.
    visible: boolean;
};

// Not wired up yet: it is rendered disabled until proximity chat exists.
export const ProximityChatButton = ({ visible }: Props) => {
    if (!visible) return null;

    return (
        <ControlButton
            type="button"
            disabled
            aria-label="Chat por proximidade"
            icon={MessageCircleIcon}
        />
    );
};
