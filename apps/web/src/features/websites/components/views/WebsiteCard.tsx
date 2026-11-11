import type { RefObject } from "react";
import { FootprintsIcon, GlobeIcon, InfoIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { WebsiteCardData } from "../../types/website";

type WebsiteCardProps = {
    // The element the page moves with the camera, so the card does not go
    // through React for every frame.
    anchorRef: RefObject<HTMLDivElement | null>;
    // The title of the page when the server read one, else the name of the object.
    title: string;
    // The icon of the site as a `data:` address the server read, so showing
    // it asks nothing of the site. A generic icon stands in without it.
    faviconUrl: string | null;
    // The server is still reading the page: the card is already usable, and
    // the title and the icon are shown as placeholders until they arrive.
    isLoadingPreview: boolean;
    data: WebsiteCardData;
    // The avatar is within reach of the object. Away from it the card says to
    // come closer, and offers to walk there.
    isInReach: boolean;
    onOpen: () => void;
    onWalk: () => void;
    onClose: () => void;
};

// Sits above the outline of the object, at its left corner. Hidden until the
// first position arrives, so it never shows at the corner of the canvas. The address is
// shown as a host in plain text, never as a link, so the one way out is the
// button.
export const WebsiteCard = ({
    anchorRef,
    title,
    faviconUrl,
    isLoadingPreview,
    data,
    isInReach,
    onOpen,
    onWalk,
    onClose,
}: WebsiteCardProps) => (
    <div
        ref={anchorRef}
        className="invisible absolute top-0 left-0 z-20 w-70 pb-2 will-change-transform"
    >
        <div className="flex flex-col gap-3 rounded-xl bg-[#1a1a1a] p-3 text-white shadow-lg ring-1 ring-white/10">
            <div className="flex items-start gap-2">
                {isLoadingPreview ? (
                    <Skeleton className="mt-0.5 size-4 shrink-0 rounded-sm bg-white/15" />
                ) : faviconUrl ? (
                    <img
                        src={faviconUrl}
                        alt=""
                        className="mt-0.5 size-4 shrink-0 rounded-sm"
                    />
                ) : (
                    <GlobeIcon className="mt-0.5 size-4 shrink-0 text-white/80" />
                )}
                {isLoadingPreview ? (
                    <div className="min-w-0 flex-1 py-0.5">
                        <Skeleton className="h-4 w-36 bg-white/15" />
                    </div>
                ) : (
                    <span className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold break-words">
                        {title}
                    </span>
                )}
                <button
                    type="button"
                    aria-label="Fechar"
                    onClick={onClose}
                    className="-mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-white/60 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-1 focus-visible:ring-white/50"
                >
                    <XIcon className="size-4" />
                </button>
            </div>
            {data.kind === "available" ? (
                <>
                    <span className="truncate text-sm text-white/60">
                        {data.host}
                    </span>
                    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2 text-xs text-white/60 ring-1 ring-white/10">
                        <InfoIcon className="size-3.5 shrink-0" />
                        Conteúdo de terceiros
                    </div>
                    {isInReach ? (
                        <Button
                            type="button"
                            icon={GlobeIcon}
                            onClick={onOpen}
                            className="h-9 w-full bg-[#3a3de8] font-semibold text-white hover:bg-[#3a3de8]/85"
                        >
                            Abrir site
                        </Button>
                    ) : (
                        <>
                            <span className="text-xs text-white/60">
                                Chegue perto do objeto para interagir com ele.
                            </span>
                            <Button
                                type="button"
                                icon={FootprintsIcon}
                                onClick={onWalk}
                                className="h-9 w-full bg-[#3a3de8] font-semibold text-white hover:bg-[#3a3de8]/85"
                            >
                                Ir até lá
                            </Button>
                        </>
                    )}
                </>
            ) : (
                <>
                    <span className="text-sm text-white/60">
                        Endereço indisponível
                    </span>
                    <span className="text-xs text-white/60">
                        O endereço deste objeto não é mais válido. Peça a quem
                        edita o mapa para corrigi-lo.
                    </span>
                </>
            )}
        </div>
    </div>
);
