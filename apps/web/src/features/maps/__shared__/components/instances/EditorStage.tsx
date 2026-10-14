import type { ReactNode } from "react";
import type { PublishResult } from "@standin/contracts";
import { EditorContent } from "@/features/maps/__shared__/components/instances/EditorContent";
import { EditorLockGate } from "@/features/maps/__shared__/components/instances/EditorLockGate";
import type { EditorThumbnailTarget } from "@/features/editor/types/thumbnail";

type EditorStageProps = {
    mapId: string;
    title: string;
    onExit: () => void;
    thumbnail?: EditorThumbnailTarget;
    actions?: ReactNode;
    onPublished?: (result: PublishResult) => void;
};

// Gets the lock first. The map and the palette load only once it is granted.
export const EditorStage = ({
    mapId,
    title,
    onExit,
    thumbnail,
    actions,
    onPublished,
}: EditorStageProps) => (
    <EditorLockGate mapId={mapId} onExit={onExit}>
        <EditorContent
            mapId={mapId}
            title={title}
            onExit={onExit}
            thumbnail={thumbnail}
            actions={actions}
            onPublished={onPublished}
        />
    </EditorLockGate>
);
