import { useHotkey } from "@/hooks/useHotkey";
import { useWebsiteFrame } from "../../hooks/useWebsiteFrame";
import { WebsiteFrame } from "../views/WebsiteFrame";

type WebsiteViewerProps = {
    url: string;
    host: string;
    title: string;
    faviconUrl: string | null;
    isBelowStageToggle: boolean;
    onClose: () => void;
};

// Keyed by the address by whoever renders it, so a new address starts a new
// load with its own timer.
export const WebsiteViewer = ({
    url,
    host,
    title,
    faviconUrl,
    isBelowStageToggle,
    onClose,
}: WebsiteViewerProps) => {
    const { status, handleLoad, handleError } = useWebsiteFrame(onClose);
    useHotkey(["escape"], onClose);

    // No opener and no referrer: the site gets nothing about the app.
    const openInTab = () => window.open(url, "_blank", "noopener,noreferrer");

    return (
        <WebsiteFrame
            url={url}
            host={host}
            title={title}
            faviconUrl={faviconUrl}
            status={status}
            onLoad={handleLoad}
            onError={handleError}
            onOpenInTab={openInTab}
            onClose={onClose}
            isBelowStageToggle={isBelowStageToggle}
        />
    );
};
