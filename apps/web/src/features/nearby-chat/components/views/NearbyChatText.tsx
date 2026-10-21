import { LinkIcon } from "lucide-react";
import { isOnlyUrl } from "@/features/game/utils/isOnlyUrl";
import { formatNearbyLink } from "@/features/nearby-chat/utils/formatNearbyLink";

type Props = { text: string };

// The text of a line, always as text. A message that is a single link becomes a
// link, with the host and the path, that opens in another tab.
export const NearbyChatText = ({ text }: Props) => {
    const label = isOnlyUrl(text) ? formatNearbyLink(text) : null;
    if (label === null)
        return <span className="min-w-0 wrap-anywhere">{text}</span>;

    return (
        <a
            href={text}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-1 text-foreground underline underline-offset-2"
        >
            <LinkIcon className="size-3 shrink-0" />
            <span className="min-w-0 truncate">{label}</span>
        </a>
    );
};
