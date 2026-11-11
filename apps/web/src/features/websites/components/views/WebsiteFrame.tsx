import type { SyntheticEvent } from "react";
import { ExternalLinkIcon, GlobeIcon, Loader2Icon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    WEBSITE_FRAME_ALLOW,
    WEBSITE_FRAME_REFERRER_POLICY,
    WEBSITE_FRAME_SANDBOX,
} from "../../consts/frame";
import type { WebsiteFrameStatus } from "../../types/frame";

type WebsiteFrameProps = {
    url: string;
    host: string;
    title: string;
    faviconUrl: string | null;
    status: WebsiteFrameStatus;
    onLoad: (event: SyntheticEvent<HTMLIFrameElement>) => void;
    onError: () => void;
    onOpenInTab: () => void;
    onClose: () => void;
    // The switch between the office and the grid takes the top right corner
    // while it is on screen, so the frame starts below it.
    isBelowStageToggle: boolean;
};

// The website of an object inside the space, over the right side of the map. It
// stays clear of the floating controls: above the bar of controls at the
// bottom (the same `bottom-20` the chips of the space use), off the column of
// zoom buttons at the right (`right-14`, 32px of buttons and their margin), and
// below the switch of views when that is on screen (`top-16`, like the stack
// of cards at the right). The frame is taken out once it fails or times out, so
// it stops loading.
export const WebsiteFrame = ({
    url,
    host,
    title,
    faviconUrl,
    status,
    onLoad,
    onError,
    onOpenInTab,
    onClose,
    isBelowStageToggle,
}: WebsiteFrameProps) => {
    const hasFailed = status === "timeout" || status === "failed";

    return (
        <div
            data-below-toggle={isBelowStageToggle}
            className="absolute top-4 right-14 bottom-20 z-30 flex w-[min(720px,calc(100%-4.5rem))] flex-col data-[below-toggle=true]:top-16 overflow-hidden rounded-xl bg-[#1a1a1a] text-white shadow-2xl ring-1 ring-white/10"
        >
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                {faviconUrl ? (
                    <img
                        src={faviconUrl}
                        alt=""
                        className="size-4 shrink-0 rounded-sm"
                    />
                ) : (
                    <GlobeIcon className="size-4 shrink-0 text-white/80" />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold">
                        {title}
                    </span>
                    <span className="truncate text-xs text-white/60">
                        {host}
                    </span>
                </div>
                <button
                    type="button"
                    aria-label="Abrir em nova aba"
                    onClick={onOpenInTab}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-white/60 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-1 focus-visible:ring-white/50"
                >
                    <ExternalLinkIcon className="size-4" />
                </button>
                <button
                    type="button"
                    aria-label="Fechar"
                    onClick={onClose}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-white/60 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-1 focus-visible:ring-white/50"
                >
                    <XIcon className="size-4" />
                </button>
            </div>
            <div className="relative min-h-0 flex-1 bg-white">
                {!hasFailed && (
                    <iframe
                        src={url}
                        title={title}
                        sandbox={WEBSITE_FRAME_SANDBOX}
                        allow={WEBSITE_FRAME_ALLOW}
                        referrerPolicy={WEBSITE_FRAME_REFERRER_POLICY}
                        onLoad={onLoad}
                        onError={onError}
                        className="size-full border-0"
                    />
                )}
                {status === "loading" && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-[#1a1a1a] text-sm text-white/60">
                        <Loader2Icon className="size-4 animate-spin" />
                        Carregando…
                    </div>
                )}
                {hasFailed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1a1a1a] p-6 text-center">
                        <span className="text-sm font-semibold">
                            {status === "timeout"
                                ? "O site demorou demais para responder."
                                : "Não foi possível carregar o site."}
                        </span>
                        <span className="max-w-xs text-xs text-white/60">
                            Alguns sites não permitem ser exibidos dentro de
                            outra página.
                        </span>
                        <Button
                            type="button"
                            icon={ExternalLinkIcon}
                            onClick={onOpenInTab}
                            className="bg-[#3a3de8] font-semibold text-white hover:bg-[#3a3de8]/85"
                        >
                            Abrir em nova aba
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
