import type { ReactNode } from "react";
import type { PublishResult } from "@standin/contracts";
import { DraftStoreProvider } from "@/features/editor/components/instances/DraftStoreProvider";
import { EditorWorkspace } from "@/features/maps/__shared__/components/instances/EditorWorkspace";
import { EditorErrorState } from "@/features/editor/components/views/EditorErrorState";
import { EditorLoadingState } from "@/features/editor/components/views/EditorLoadingState";
import { useEditorMapData } from "@/features/maps/__shared__/hooks/useEditorMapData";
import { useEditorModel } from "@/features/maps/__shared__/hooks/useEditorModel";
import type { EditorThumbnailTarget } from "@/features/editor/types/thumbnail";

type EditorContentProps = {
    mapId: string;
    title: string;
    onExit: () => void;
    thumbnail?: EditorThumbnailTarget;
    actions?: ReactNode;
    onPublished?: (result: PublishResult) => void;
};

export const EditorContent = ({
    mapId,
    title,
    onExit,
    thumbnail,
    actions,
    onPublished,
}: EditorContentProps) => {
    const { map, isError: isMapError } = useEditorMapData(mapId);
    const { model, isError: isModelError } = useEditorModel(mapId);

    if (isMapError || isModelError) return <EditorErrorState />;
    if (!map || !model) return <EditorLoadingState />;

    return (
        <DraftStoreProvider model={model}>
            <EditorWorkspace
                mapId={mapId}
                title={title}
                map={map}
                onExit={onExit}
                thumbnail={thumbnail}
                actions={actions}
                onPublished={onPublished}
            />
        </DraftStoreProvider>
    );
};
