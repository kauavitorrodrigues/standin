import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AssetDefinition, PlacedAsset } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { useHotkey } from "@/hooks/useHotkey";
import { WEBSITE_EVENTS } from "@/features/game/consts/website";
import { useHoverClick } from "@/features/game/hooks/useHoverClick";
import type { GameEngineHandle } from "@/features/game/types/game";
import { usePrefetchPreview } from "../../hooks/usePrefetchPreview";
import { useWebsiteSession } from "../../hooks/useWebsiteSession";
import { useWebsiteViewers } from "../../hooks/useWebsiteViewers";
import { WebsitesQueries } from "../../queries";
import type { WebsiteViewerPerson } from "../../types/viewers";
import { resolveWebsiteCard } from "../../utils/resolveWebsiteCard";
import { listViewerIds } from "../../utils/websiteViewers";
import { WebsiteCard } from "../views/WebsiteCard";
import { WebsiteViewer } from "./WebsiteViewer";

type WebsiteHoverCardProps = {
    handle: GameEngineHandle | null;
    mapId: string;
    // The row of the top right corner the chip of the open site goes in.
    chipHost: HTMLElement | null;
    placed: readonly PlacedAsset[];
    assets: readonly Pick<AssetDefinition, "id" | "name">[];
    // The stage shows the office. On the grid of the meeting the site is put
    // away, and it comes back with the office.
    isOfficeView: boolean;
    selfUserId: string;
    names: ReadonlyMap<string, string>;
    avatars: ReadonlyMap<string, string | null>;
    // Guests look at the site but do not close it for the others.
    canCloseForViewers: boolean;
};

// The card of the object with a website that was clicked, and the frame that
// shows the website once the person chooses to open it, over the stage. The
// card stays outlined and follows the camera until a click anywhere else or Esc
// drops it. The site only opens, and only stays open, within reach of the
// object; from afar the card offers to walk there.
export const WebsiteHoverCard = ({
    handle,
    mapId,
    chipHost,
    placed,
    assets,
    isOfficeView,
    selfUserId,
    names,
    avatars,
    canCloseForViewers,
}: WebsiteHoverCardProps) => {
    const [openId, setOpenId] = useState<string | null>(null);
    // The object whose website is open in the frame, which outlives the card.
    const session = useWebsiteSession(handle);
    const { viewingId, inReachIds, close: closeViewer } = session;
    const anchorRef = useRef<HTMLDivElement | null>(null);
    const origins = [window.location.origin];
    const data =
        openId === null ? null : resolveWebsiteCard(placed, openId, origins);
    const viewingData =
        viewingId === null
            ? null
            : resolveWebsiteCard(placed, viewingId, origins);
    const { data: preview, isLoading: isPreviewLoading } =
        WebsitesQueries.usePreview(
            mapId,
            openId,
            data?.kind === "available" ? data.url : null
        );
    const { data: viewingPreview } = WebsitesQueries.usePreview(
        mapId,
        viewingId,
        viewingData?.kind === "available" ? viewingData.url : null
    );

    usePrefetchPreview(handle, mapId, placed);

    const handleClosedByOther = useCallback(
        (_objectId: string, byUserId: string) => {
            closeViewer();
            if (byUserId === selfUserId) return;

            const name = names.get(byUserId) ?? "Alguém";
            toast.add({
                title: `${name} fechou o site para quem estava vendo.`,
                type: "info",
            });
        },
        [closeViewer, selfUserId, names]
    );
    const { viewers, closeForViewers } = useWebsiteViewers({
        activeObjectId: viewingId,
        onClosedByOther: handleClosedByOther,
    });
    const viewerPeople = useMemo<WebsiteViewerPerson[]>(() => {
        if (viewingId === null) return [];

        const userIds = listViewerIds(viewers, viewingId, selfUserId, true);
        return userIds.map((userId) => ({
            userId,
            name: names.get(userId) ?? "Alguém",
            avatar: avatars.get(userId) ?? null,
        }));
    }, [viewers, viewingId, selfUserId, names, avatars]);

    useEffect(() => {
        handle?.selectHover(WEBSITE_EVENTS.HOVER_CHANGED, openId);
    }, [handle, openId]);

    // The position goes straight to the element, in the same frame the
    // canvas was drawn. Going through state would draw the card after the
    // canvas, and it would lag and flicker while the camera zooms.
    useEffect(() => {
        if (!handle) return;

        return handle.subscribeToSelected(
            WEBSITE_EVENTS.HOVER_CHANGED,
            (selected) => {
                const node = anchorRef.current;
                if (!node) return;

                if (!selected) {
                    node.style.visibility = "hidden";
                    return;
                }

                const { x, y } = selected.screen;
                node.style.transform = `translate3d(${x}px, ${y}px, 0) translateY(-100%)`;
                node.style.visibility = "visible";
            }
        );
    }, [handle]);

    useHoverClick(handle, WEBSITE_EVENTS.HOVER_CHANGED, setOpenId);
    useHotkey(["escape"], () => setOpenId(null), { enabled: openId !== null });

    const findObjectName = (objectId: string): string => {
        const assetId = placed.find((item) => item.id === objectId)?.assetId;
        return assets.find((asset) => asset.id === assetId)?.name ?? "";
    };

    const viewer =
        viewingId !== null && viewingData?.kind === "available" ? (
            <WebsiteViewer
                key={viewingData.url}
                url={viewingData.url}
                host={viewingData.host}
                title={viewingPreview?.title ?? findObjectName(viewingId)}
                faviconUrl={viewingPreview?.faviconDataUrl ?? null}
                viewers={viewerPeople}
                isMinimized={session.isMinimized}
                isHidden={!isOfficeView}
                canCloseForViewers={canCloseForViewers}
                chipHost={chipHost}
                onToggleMinimized={session.toggleMinimized}
                onCloseForViewers={() => void closeForViewers(viewingId)}
                onClose={closeViewer}
            />
        ) : null;

    if (openId === null || !data) return viewer;

    // The card gives way to the frame: the site opens inside the space.
    const open = () => {
        session.open(openId);
        setOpenId(null);
    };
    const walk = () => {
        session.walkTo(openId);
        setOpenId(null);
    };

    return (
        <>
            <WebsiteCard
                anchorRef={anchorRef}
                title={preview?.title ?? findObjectName(openId)}
                faviconUrl={preview?.faviconDataUrl ?? null}
                isLoadingPreview={isPreviewLoading}
                data={data}
                isInReach={inReachIds.includes(openId)}
                onOpen={open}
                onWalk={walk}
                onClose={() => setOpenId(null)}
            />
            {viewer}
        </>
    );
};
