import { useEffect, useRef, useState } from "react";
import type { AssetDefinition, PlacedAsset } from "@standin/contracts";
import { useHotkey } from "@/hooks/useHotkey";
import { WEBSITE_EVENTS } from "@/features/game/consts/website";
import { useHoverClick } from "@/features/game/hooks/useHoverClick";
import type { GameEngineHandle } from "@/features/game/types/game";
import { usePrefetchPreview } from "../../hooks/usePrefetchPreview";
import { WebsitesQueries } from "../../queries";
import { resolveWebsiteCard } from "../../utils/resolveWebsiteCard";
import { WebsiteCard } from "../views/WebsiteCard";
import { WebsiteViewer } from "./WebsiteViewer";

type WebsiteHoverCardProps = {
    handle: GameEngineHandle | null;
    mapId: string;
    // The switch of views is on screen, so the frame starts below it.
    isBelowStageToggle: boolean;
    placed: readonly PlacedAsset[];
    assets: readonly Pick<AssetDefinition, "id" | "name">[];
};

// The card of the object with a website that was clicked, and the frame that
// shows the website once the person chooses to open it. The card stays
// outlined and follows the camera until a click anywhere else or Esc drops it.
export const WebsiteHoverCard = ({
    handle,
    mapId,
    isBelowStageToggle,
    placed,
    assets,
}: WebsiteHoverCardProps) => {
    const [openId, setOpenId] = useState<string | null>(null);
    // The object whose website is open in the frame, which outlives the card.
    const [viewingId, setViewingId] = useState<string | null>(null);
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
                isBelowStageToggle={isBelowStageToggle}
                onClose={() => setViewingId(null)}
            />
        ) : null;

    if (openId === null || !data) return viewer;

    // The card gives way to the frame: the site opens inside the space.
    const open = () => {
        setViewingId(openId);
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
                onOpen={open}
                onClose={() => setOpenId(null)}
            />
            {viewer}
        </>
    );
};
