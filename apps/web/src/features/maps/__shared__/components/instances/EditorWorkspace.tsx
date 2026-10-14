import type { ReactNode } from "react";
import type { PublishResult } from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { GameMapData } from "@/features/game/types/tilemap";
import { EditorLayout } from "@/features/maps/__shared__/components/layout";
import { EditorDialogs } from "@/features/maps/__shared__/components/instances/EditorDialogs";
import { EditorCanvas } from "@/features/maps/__shared__/components/instances/EditorCanvas";
import { EditorZoom } from "@/features/maps/__shared__/components/instances/EditorZoom";
import { EditorLockNotice } from "@/features/maps/__shared__/components/instances/EditorLockNotice";
import { EditorBottomBar } from "@/features/maps/__shared__/components/instances/EditorBottomBar";
import { EditorSidePanel } from "@/features/maps/__shared__/components/instances/EditorSidePanel";
import { EditorPanelToggle } from "@/features/maps/__shared__/components/instances/EditorPanelToggle";
import { ZoneNamePopover } from "@/features/maps/__shared__/components/instances/ZoneNamePopover";
import { ZoneToolOptions } from "@/features/maps/__shared__/components/instances/ZoneToolOptions";
import { ZoneToolbar } from "@/features/maps/__shared__/components/instances/ZoneToolbar";
import { ObjectToolbar } from "@/features/maps/__shared__/components/instances/ObjectToolbar";
import { EditorToolRail } from "@/features/maps/__shared__/components/instances/EditorToolRail";
import { useDraftPersistence } from "@/features/maps/__shared__/hooks/useDraftPersistence";
import { useDraftStore } from "@/features/maps/__shared__/hooks/useDraftStore";
import { useLockRecovery } from "@/features/maps/__shared__/hooks/useLockRecovery";
import { useResumeDraft } from "@/features/maps/__shared__/hooks/useResumeDraft";
import { useSceneSync } from "@/features/maps/__shared__/hooks/useSceneSync";
import { useEditorEngine } from "@/features/maps/__shared__/hooks/useEditorEngine";
import { useEditorHotkeys } from "@/features/maps/__shared__/hooks/useEditorHotkeys";
import { useEditorSelector } from "@/features/maps/__shared__/hooks/useEditorSelector";
import { useMissingThumbnail } from "@/features/maps/__shared__/hooks/useMissingThumbnail";
import { usePublishedThumbnail } from "@/features/maps/__shared__/hooks/usePublishedThumbnail";
import { EDITOR_STATUS } from "@/features/maps/__shared__/consts/status";
import type { EditorThumbnailTarget } from "@/features/maps/__shared__/types/thumbnail";

type EditorWorkspaceProps = {
    mapId: string;
    title: string;
    map: GameMapData;
    onExit: () => void;
    thumbnail?: EditorThumbnailTarget;
    actions?: ReactNode;
    onPublished?: (result: PublishResult) => void;
};

// The editor with its model loaded: tool rail, side panel and canvas.
// It owns the engine so the zoom can ask it to fit the map.
export const EditorWorkspace = ({
    mapId,
    title,
    map,
    onExit,
    thumbnail,
    actions,
    onPublished,
}: EditorWorkspaceProps) => {
    const sceneLink = useSceneSync();
    const {
        containerRef,
        coordinatesRef,
        hintRef,
        toolbarRef,
        zoneToolbarRef,
        fitCamera,
        focusCell,
        captureThumbnail,
        zoneNameRequest,
        confirmZoneName,
        cancelZoneName,
    } = useEditorEngine(map, sceneLink);
    const ready = useEditorSelector(
        (state) => state.status === EDITOR_STATUS.READY
    );
    const { user } = useAuth();
    const draftStore = useDraftStore();
    const resumeDraft = useResumeDraft();
    // Writes the draft to IndexedDB, but only after the user answered the
    // resume question, so a saved draft is never overwritten before that.
    useDraftPersistence(draftStore, user.id, mapId, resumeDraft.settled);
    useLockRecovery();
    useEditorHotkeys(fitCamera);
    useMissingThumbnail({ thumbnail, ready, capture: captureThumbnail });
    const handlePublished = usePublishedThumbnail({
        thumbnail,
        capture: captureThumbnail,
        onPublished,
    });

    return (
        <EditorLayout.Frame mapId={mapId}>
            <EditorLayout.Body>
                <EditorLayout.Canvas>
                    <EditorCanvas
                        containerRef={containerRef}
                        coordinatesRef={coordinatesRef}
                        hintRef={hintRef}
                    />
                    <EditorSidePanel
                        mapId={mapId}
                        title={title}
                        actions={actions}
                        onExit={onExit}
                    />
                    <EditorPanelToggle />
                    <EditorToolRail />
                    <ZoneToolOptions />
                    <ZoneNamePopover
                        request={zoneNameRequest}
                        onConfirm={confirmZoneName}
                        onCancel={cancelZoneName}
                    />
                    <ObjectToolbar toolbarRef={toolbarRef} />
                    <ZoneToolbar toolbarRef={zoneToolbarRef} />
                    <EditorZoom onFit={fitCamera} />
                    <EditorLockNotice />
                    <EditorBottomBar />
                </EditorLayout.Canvas>
                <EditorDialogs
                    resumeDraft={resumeDraft}
                    onExit={onExit}
                    onFocusCell={focusCell}
                    onPublished={handlePublished}
                />
            </EditorLayout.Body>
        </EditorLayout.Frame>
    );
};
