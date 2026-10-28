import { useState, type ReactNode } from "react";
import type { PublishResult } from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { GameMapData } from "@/features/game/types/tilemap";
import { EditorLayout } from "@/features/editor/components/layout";
import { EditorDialogs } from "@/features/maps/__shared__/components/instances/EditorDialogs";
import { EditorCanvas } from "@/features/editor/components/instances/EditorCanvas";
import { EditorZoom } from "@/features/editor/components/instances/EditorZoom";
import { EditorLockNotice } from "@/features/maps/__shared__/components/instances/EditorLockNotice";
import { EditorBottomBar } from "@/features/maps/__shared__/components/instances/EditorBottomBar";
import { EditorSidePanel } from "@/features/maps/__shared__/components/instances/EditorSidePanel";
import { EditorPanelToggle } from "@/features/editor/components/instances/EditorPanelToggle";
import { ZoneNamePopover } from "@/features/editor/components/instances/ZoneNamePopover";
import { ZoneToolOptions } from "@/features/editor/components/instances/ZoneToolOptions";
import { ZoneToolbar } from "@/features/editor/components/instances/ZoneToolbar";
import { RoomPanel } from "@/features/editor/components/instances/RoomPanel";
import { ObjectToolbar } from "@/features/editor/components/instances/ObjectToolbar";
import { EditorToolRail } from "@/features/editor/components/instances/EditorToolRail";
import { useDraftPersistence } from "@/features/maps/__shared__/hooks/useDraftPersistence";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useLockRecovery } from "@/features/maps/__shared__/hooks/useLockRecovery";
import { useResumeDraft } from "@/features/maps/__shared__/hooks/useResumeDraft";
import { useSceneSync } from "@/features/editor/hooks/useSceneSync";
import { useEditorEngine } from "@/features/editor/hooks/useEditorEngine";
import { useEditorHotkeys } from "@/features/editor/hooks/useEditorHotkeys";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useMissingThumbnail } from "@/features/maps/__shared__/hooks/useMissingThumbnail";
import { usePublishedThumbnail } from "@/features/maps/__shared__/hooks/usePublishedThumbnail";
import { createThumbnailMemory } from "@/features/maps/__shared__/utils/createThumbnailMemory";
import { MAP_TOOL_META } from "@/features/editor/consts/toolMeta";
import { EDITOR_STATUS } from "@/features/editor/consts/status";
import type { EditorThumbnailTarget } from "@/features/editor/types/thumbnail";

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
    // Shared by the first photo and the ones after each publish, so a photo
    // equal to the last one sent is not sent again.
    const [lastSavedThumbnail] = useState(createThumbnailMemory);
    useMissingThumbnail({
        thumbnail,
        ready,
        capture: captureThumbnail,
        lastSaved: lastSavedThumbnail,
    });
    const handlePublished = usePublishedThumbnail({
        thumbnail,
        capture: captureThumbnail,
        lastSaved: lastSavedThumbnail,
        onPublished,
    });

    return (
        <EditorLayout.Frame>
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
                    <EditorToolRail tools={MAP_TOOL_META} />
                    <ZoneToolOptions />
                    <ZoneNamePopover
                        request={zoneNameRequest}
                        onConfirm={confirmZoneName}
                        onCancel={cancelZoneName}
                    />
                    <ObjectToolbar toolbarRef={toolbarRef} />
                    <ZoneToolbar toolbarRef={zoneToolbarRef} />
                    <RoomPanel />
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
