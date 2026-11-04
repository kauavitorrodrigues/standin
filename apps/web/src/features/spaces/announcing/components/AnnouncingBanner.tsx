import type { ReactNode } from "react";
import type { SpaceAnnouncer } from "@standin/contracts";
import { MegaphoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ANNOUNCING_BANNER_TEXTS } from "../consts/announcingBanner";
import { listAnnouncerNames } from "../utils/listAnnouncerNames";
import { resolveAnnouncingVerb } from "../utils/resolveAnnouncingVerb";
import { resolveShellPadding } from "../utils/resolveShellPadding";
import { resolveVideoButtonText } from "../utils/resolveVideoButtonText";

type Props = {
    // The list as the server sent it, already in the order to show.
    announcers: readonly SpaceAnnouncer[];
    isAnnouncing: boolean;
    isSharingVideo: boolean;
    // The camera is on, so there is something to show.
    canShareVideo: boolean;
    names: ReadonlyMap<string, string>;
    // Absent where the person cannot announce, so there is no button.
    onStop?: () => void;
    // Absent where the person cannot share, so there is no button.
    onToggleVideo?: () => void;
};

type ShellProps = {
    text: string;
    // The button, absent where there is nothing to press.
    action?: ReactNode;
};

// It has no position of its own: the video stage puts it under the strip of
// videos, or at the top when there is no strip. The height of a button row and
// a minimum width keep its size the same with or without a button.
const Shell = ({ text, action }: ShellProps) => (
    <div
        role="status"
        className={cn(
            "pointer-events-auto flex min-h-10 min-w-64 animate-in items-center gap-2.5 rounded-xl bg-muted py-1 pl-3 text-xs font-semibold text-foreground ring-1 ring-foreground/10 duration-300 ease-out fade-in-0 slide-in-from-top-4 motion-reduce:animate-none",
            resolveShellPadding(action !== undefined)
        )}
    >
        <MegaphoneIcon className="size-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate">{text}</span>
        {action}
    </div>
);

// A persistent notice, not a toast: it stays while someone near announces or
// while I do, and goes away when neither is true.
export const AnnouncingBanner = ({
    announcers,
    isAnnouncing,
    isSharingVideo,
    canShareVideo,
    names,
    onStop,
    onToggleVideo,
}: Props) => {
    if (isAnnouncing) {
        return (
            <Shell
                text={ANNOUNCING_BANNER_TEXTS.self}
                action={
                    onStop && (
                        <Button type="button" onClick={onStop}>
                            {ANNOUNCING_BANNER_TEXTS.stopButton}
                        </Button>
                    )
                }
            />
        );
    }

    if (announcers.length === 0) return null;

    const who = listAnnouncerNames(
        announcers,
        names,
        ANNOUNCING_BANNER_TEXTS.unknownName
    ).join(", ");
    const text = `${who} ${resolveAnnouncingVerb(announcers.length)}`;

    if (!onToggleVideo || !canShareVideo) return <Shell text={text} />;

    return (
        <Shell
            text={text}
            action={
                <Button type="button" onClick={onToggleVideo}>
                    {resolveVideoButtonText(isSharingVideo)}
                </Button>
            }
        />
    );
};
