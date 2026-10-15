import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DECORATOR_LOCK_NOTICE_MESSAGES } from "@/features/decorator/consts/messages";

type LockLostNoticeProps = {
    text: string;
    isRecovering: boolean;
    onRecover: () => void;
};

// Over the game, above the media bar: the decorator is read only because the
// lock is gone. It stays until the lock is back.
export const LockLostNotice = ({
    text,
    isRecovering,
    onRecover,
}: LockLostNoticeProps) => (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-40 flex justify-center px-4">
        <div
            role="status"
            className="pointer-events-auto flex max-w-xl items-center gap-3 rounded-lg border bg-background/90 py-2 pr-2 pl-3 text-sm shadow-sm backdrop-blur"
        >
            <InfoIcon className="size-4 shrink-0 text-muted-foreground" />
            <span>{text}</span>
            <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={isRecovering}
                onClick={onRecover}
            >
                {DECORATOR_LOCK_NOTICE_MESSAGES.RECOVER}
            </Button>
        </div>
    </div>
);
