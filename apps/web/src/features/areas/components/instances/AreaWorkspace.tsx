import { FormProvider } from "react-hook-form";
import { EditorLayout } from "@/features/editor/components/layout";
import { EditorCanvas } from "@/features/editor/components/instances/EditorCanvas";
import { EditorPanelToggle } from "@/features/editor/components/instances/EditorPanelToggle";
import { EditorZoom } from "@/features/editor/components/instances/EditorZoom";
import { ObjectToolbar } from "@/features/editor/components/instances/ObjectToolbar";
import type { GameMapData } from "@/features/game/types/tilemap";
import { useComposer } from "../../hooks/useComposer";
import type { AreaPalette } from "../../types/areaPalette";
import type { ComposerStart } from "../../types/composerStart";
import { AreaBottomBar } from "./AreaBottomBar";
import { AreaDialogs } from "./AreaDialogs";
import { AreaSidePanel } from "./AreaSidePanel";
import { AreaToolRail } from "./AreaToolRail";
import { AreaIssueList } from "../views/AreaIssueList";

type Props = {
    areaId?: string;
    map: GameMapData;
    start: ComposerStart;
    palette: AreaPalette;
    onExit: () => void;
};

// The composer with its canvas loaded: tool rail, side panel, canvas with the
// frame of the area, and the bar of discard and save. The properties of the
// area are asked before, and open again from the title of the side panel.
export const AreaWorkspace = ({
    areaId,
    map,
    start,
    palette,
    onExit,
}: Props) => {
    const composer = useComposer({ areaId, map, start, onExit });
    const { engine } = composer;

    return (
        <FormProvider {...composer.form}>
            <EditorLayout.Frame>
                <EditorLayout.Body>
                    <EditorLayout.Canvas>
                        <EditorCanvas
                            containerRef={engine.containerRef}
                            coordinatesRef={engine.coordinatesRef}
                            hintRef={engine.hintRef}
                        />
                        <AreaSidePanel
                            palette={palette}
                            onExit={composer.requestExit}
                        />
                        <EditorPanelToggle />
                        <AreaToolRail />
                        <ObjectToolbar toolbarRef={engine.toolbarRef} />
                        <EditorZoom onFit={engine.fitCamera} />
                        <AreaIssueList
                            issues={composer.issues}
                            onClose={composer.clearIssues}
                        />
                        <AreaBottomBar
                            isDirty={composer.isDirty}
                            isSaving={composer.isSaving}
                            onSave={composer.saveAndExit}
                        />
                    </EditorLayout.Canvas>
                    <AreaDialogs
                        guard={composer.guard}
                        isSaving={composer.isSaving}
                        onExit={onExit}
                        onDiscard={composer.discard}
                        onSaveAndExit={composer.saveAndExit}
                    />
                </EditorLayout.Body>
            </EditorLayout.Frame>
        </FormProvider>
    );
};
