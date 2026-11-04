import type { ReactNode } from "react";
import type { SpaceAnnouncer } from "@standin/contracts";
import { MegaphoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ANNOUNCING_BANNER_TEXTS } from "../consts/announcingBanner";
import { listAnnouncerNames } from "../utils/listAnnouncerNames";
import { resolveAnnouncingVerb } from "../utils/resolveAnnouncingVerb";

type Props = {
    // The list as the server sent it, already in the order to show.
    announcers: readonly SpaceAnnouncer[];
    isAnnouncing: boolean;
    names: ReadonlyMap<string, string>;
    // Absent where the person cannot announce, so there is no button.
    onStop?: () => void;
};

const Shell = ({ children }: { children: ReactNode }) => (
    <div
        role="status"
        className="pointer-events-none absolute top-3 right-0 left-(--rail-width) z-30 flex justify-center px-4"
    >
        <div className="pointer-events-auto flex animate-in items-center gap-2.5 rounded-xl bg-muted py-1 pr-1 pl-3 text-xs font-semibold text-foreground ring-1 ring-foreground/10 duration-300 ease-out fade-in-0 slide-in-from-top-4 motion-reduce:animate-none">
            <MegaphoneIcon className="size-4 text-primary" />
            {children}
        </div>
    </div>
);

// A persistent notice, not a toast: it stays while someone near announces or
// while I do, and goes away when neither is true.
export const AnnouncingBanner = ({
    announcers,
    isAnnouncing,
    names,
    onStop,
}: Props) => {
    if (isAnnouncing) {
        return (
            <Shell>
                {ANNOUNCING_BANNER_TEXTS.self}
                {onStop && (
                    <Button type="button" onClick={onStop}>
                        {ANNOUNCING_BANNER_TEXTS.stopButton}
                    </Button>
                )}
            </Shell>
        );
    }

    if (announcers.length === 0) return null;

    const who = listAnnouncerNames(
        announcers,
        names,
        ANNOUNCING_BANNER_TEXTS.unknownName
    ).join(", ");
    
    return (
        <Shell>
            {who} {resolveAnnouncingVerb(announcers.length)}
        </Shell>
    );
};
