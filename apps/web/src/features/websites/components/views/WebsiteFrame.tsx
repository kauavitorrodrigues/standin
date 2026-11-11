import type { SyntheticEvent } from "react";
import { ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    WEBSITE_FRAME_ALLOW,
    WEBSITE_FRAME_REFERRER_POLICY,
    WEBSITE_FRAME_SANDBOX,
} from "../../consts/frame";
import type { WebsiteFrameStatus } from "../../types/frame";

type WebsiteFrameProps = {
    url: string;
    title: string;
    status: WebsiteFrameStatus;
    onLoad: (event: SyntheticEvent<HTMLIFrameElement>) => void;
    onError: () => void;
    onOpenInTab: () => void;
};

// The site itself, filling the box the viewer gives it. The frame is taken out
// once it fails or times out, so it stops loading.
export const WebsiteFrame = ({
    url,
    title,
    status,
    onLoad,
    onError,
    onOpenInTab,
}: WebsiteFrameProps) => {
    const hasFailed = status === "timeout" || status === "failed";

    return (
        <div className="relative size-full overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-white/10">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1a1a1a] p-6 text-center text-white">
                    <span className="text-sm font-semibold">
                        {status === "timeout"
                            ? "O site demorou demais para responder."
                            : "Não foi possível carregar o site."}
                    </span>
                    <span className="max-w-xs text-xs text-white/60">
                        Alguns sites não permitem ser exibidos dentro de outra
                        página.
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
    );
};
