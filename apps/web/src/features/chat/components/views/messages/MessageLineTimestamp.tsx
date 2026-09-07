import { formatMessageTime } from "@/features/chat/utils/formatMessageTime";

type Props = { createdAt: string };

// Sits in the same gutter the first message's avatar occupies, revealed
// only while this specific row (its `group/line` ancestor) is hovered.
export const MessageLineTimestamp = ({ createdAt }: Props) => (
    <span className="absolute inset-y-0 left-3 flex w-7 items-center justify-center text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover/line:opacity-100">
        {formatMessageTime(createdAt)}
    </span>
);
