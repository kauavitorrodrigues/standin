import type { MessageMention } from "@standin/contracts";
import { MENTION_CHIP_CLASS } from "@/components/markdown/editor/consts/mention";
import { buildMessageParts } from "@/features/chat/utils/buildMessageParts";

type Props = {
    content: string;
    mentions: readonly MessageMention[];
};

// The text of a message, with each mention as a highlighted chip.
export const MessageContent = ({ content, mentions }: Props) =>
    buildMessageParts(content, mentions).map((part, index) => {
        if (part.type === "text") return part.text;
        return (
            <span
                key={`${part.userId}-${index}`}
                data-mention-id={part.userId}
                className={MENTION_CHIP_CLASS}
            >
                {part.label}
            </span>
        );
    });
