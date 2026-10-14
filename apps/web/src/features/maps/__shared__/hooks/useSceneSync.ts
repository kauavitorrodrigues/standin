import { useEffect, useMemo, useState } from "react";
import { useDraftStore } from "@/features/maps/__shared__/hooks/useDraftStore";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";
import { createSceneSync } from "@/features/maps/__shared__/lib/SceneSync";

// Links the DraftStore and the zones toggle to the scene, outside React. The
// engine hands the scene over with `attach` when it is ready and takes it
// back with `detach`. Unmounting drops the subscriptions.
export const useSceneSync = () => {
    const draftStore = useDraftStore();
    const editorStore = useEditorStore();
    const [sync] = useState(() => createSceneSync(draftStore, editorStore));

    useEffect(() => {
        sync.start();
        return () => {
            sync.stop();
        };
    }, [sync]);

    // Stable, because the engine is rebuilt when its inputs change.
    return useMemo(
        () => ({ attachScene: sync.attach, detachScene: sync.detach }),
        [sync]
    );
};
