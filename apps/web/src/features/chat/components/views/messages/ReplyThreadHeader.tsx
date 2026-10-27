import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatReplyCount } from "@/features/chat/utils/formatReplyCount";

type Props = { replyCount: number; onClose: () => void };

export const ReplyThreadHeader = ({ replyCount, onClose }: Props) => (
    <div className="flex shrink-0 items-center justify-between gap-2 px-1 pb-2">
        <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold">Conversa</span>
            <span className="text-xs text-muted-foreground">
                {formatReplyCount(replyCount)}
            </span>
        </div>
        <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Fechar conversa"
            onClick={onClose}
        >
            <XIcon />
        </Button>
    </div>
);
