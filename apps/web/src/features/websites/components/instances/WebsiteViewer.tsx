import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useHotkey } from "@/hooks/useHotkey";
import { useWebsiteFrame } from "../../hooks/useWebsiteFrame";
import type { WebsiteViewerPerson } from "../../types/viewers";
import { WebsiteChip } from "../views/WebsiteChip";
import { WebsiteFrame } from "../views/WebsiteFrame";

type WebsiteViewerProps = {
    url: string;
    host: string;
    title: string;
    faviconUrl: string | null;
    // Who is looking at the site, the local person included.
    viewers: readonly WebsiteViewerPerson[];
    // The person put it away. The site stays loaded, so it comes back as it was.
    isMinimized: boolean;
    // The view is not the office, so nothing is on the stage. The site stays
    // loaded here as well.
    isHidden: boolean;
    canCloseForViewers: boolean;
    // Where the chip goes: the row of the top right corner, next to the switch
    // of views, so the two line up. Null until that row is mounted.
    chipHost: HTMLElement | null;
    onToggleMinimized: () => void;
    onCloseForViewers: () => void;
    onClose: () => void;
};

// Keyed by the address by whoever renders it, so a new address starts a new
// load with its own timer.
//
// The site opens in the same box as the meeting view (from the rail of the
// sidebar to the right edge, so it never goes under the sidebar), on a black
// background that covers the map and its floating buttons. The bar of controls
// stays above it and the frame leaves room for it (`pb-20`); the switch of
// views keeps its corner and the chip sits in the same row, beside it, with the
// same height; the site starts below that row (`pt-16`). Minimized, the black
// goes away and only the chip stays over the map.
export const WebsiteViewer = ({
    url,
    host,
    title,
    faviconUrl,
    viewers,
    isMinimized,
    isHidden,
    canCloseForViewers,
    chipHost,
    onToggleMinimized,
    onCloseForViewers,
    onClose,
}: WebsiteViewerProps) => {
    const { status, handleLoad, handleError } = useWebsiteFrame(onClose);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useHotkey(["escape"], onClose, {
        enabled: !isHidden && !isMinimized && !isMenuOpen,
    });

    // No opener and no referrer: the site gets nothing about the app.
    const openInTab = () => window.open(url, "_blank", "noopener,noreferrer");

    const copyLink = () => {
        navigator.clipboard.writeText(url).then(
            () => toast.add({ title: "Link copiado", type: "success" }),
            () =>
                toast.add({
                    title: `Não foi possível copiar o link de ${host}.`,
                    type: "error",
                })
        );
    };

    const chip = (
        <WebsiteChip
            title={title}
            host={host}
            faviconUrl={faviconUrl}
            viewers={viewers}
            isMinimized={isMinimized}
            canCloseForViewers={canCloseForViewers}
            onMenuOpenChange={setIsMenuOpen}
            onCopyLink={copyLink}
            onToggleMinimized={onToggleMinimized}
            onOpenInTab={openInTab}
            onCloseForViewers={onCloseForViewers}
            onClose={onClose}
        />
    );

    return (
        <div
            className={cn(
                "absolute top-0 right-0 bottom-0 left-(--rail-width) z-20 flex flex-col gap-2 p-3 pt-16 pb-20",
                isMinimized
                    ? "pointer-events-none"
                    : "pointer-events-auto bg-black animate-in fade-in-0 duration-200",
                isHidden && "hidden"
            )}
        >
            {chipHost && !isHidden && createPortal(chip, chipHost)}
            <div className={cn("min-h-0 flex-1", isMinimized && "hidden")}>
                <WebsiteFrame
                    url={url}
                    title={title}
                    status={status}
                    onLoad={handleLoad}
                    onError={handleError}
                    onOpenInTab={openInTab}
                />
            </div>
        </div>
    );
};
