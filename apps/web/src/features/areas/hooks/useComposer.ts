import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { GameMapData } from "@/features/game/types/tilemap";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { EDITOR_DIALOG } from "@/features/editor/consts/editor-dialog";
import { useEditorEngine } from "@/features/editor/hooks/useEditorEngine";
import { useEditorHotkeys } from "@/features/editor/hooks/useEditorHotkeys";
import { useSceneSync } from "@/features/editor/hooks/useSceneSync";
import { createFrameStore } from "@/features/editor/lib/FrameStore";
import { useUnsavedChangesGuard } from "@/features/tilesets/hooks/useUnsavedChangesGuard";
import { AREA_FRAME_LIMITS } from "../consts/composer";
import type { AreaComposerFormValues } from "../types/areaComposerForm";
import type { ComposerStart } from "../types/composerStart";
import { AreaComposerSchema } from "../utils/areaComposerSchema";
import { useComposerDirty } from "./useComposerDirty";
import { useComposerDiscard } from "./useComposerDiscard";
import { useComposerSave } from "./useComposerSave";

type Params = {
    areaId?: string;
    map: GameMapData;
    start: ComposerStart;
    // Where to go when the user leaves: the list of areas.
    onExit: () => void;
};

// Everything the composer needs besides what it draws: the fields, the frame,
// the engine, whether there is something unsaved, and the actions. It has no
// lock, no saved draft and no publish. The frame store and the engine are made
// here once so the pieces of the screen share them.
export const useComposer = ({ areaId, map, start, onExit }: Params) => {
    const form = useForm<AreaComposerFormValues>({
        resolver: zodResolver(AreaComposerSchema),
        defaultValues: start.values,
    });
    const store = useEditorStore();
    const draftStore = useDraftStore();
    const [frameStore] = useState(() => createFrameStore(start.frame));
    const frame = useMemo(
        () => ({ store: frameStore, limits: AREA_FRAME_LIMITS }),
        [frameStore]
    );

    const sceneLink = useSceneSync();
    const engine = useEditorEngine(map, sceneLink, frame);

    const isDirty = useComposerDirty({
        control: form.control,
        frameStore,
        initialFrame: start.frame,
    });
    const guard = useUnsavedChangesGuard(isDirty);
    const saving = useComposerSave({
        areaId,
        form,
        draftStore,
        frameStore,
        captureSnapshot: engine.captureNativeSnapshot,
    });
    const discard = useComposerDiscard({
        form,
        draftStore,
        frameStore,
        initialFrame: start.frame,
    });

    // Saving leaves for the list, past the guard that warns about unsaved work.
    const saveAndExit = async () => {
        if (!(await saving.save())) return;
        guard.release();
        onExit();
    };

    // The back button: leaves right away when nothing is unsaved, otherwise asks.
    const requestExit = () => {
        if (!isDirty) {
            onExit();
            return;
        }
        store.openDialog(EDITOR_DIALOG.EXIT);
    };

    useEditorHotkeys(engine.fitCamera, { zones: false, onSave: saveAndExit });

    return {
        form,
        engine,
        guard,
        isDirty,
        isSaving: saving.isSaving,
        issues: saving.issues,
        clearIssues: saving.clearIssues,
        saveAndExit,
        requestExit,
        discard,
    };
};
