import type { ReactNode } from "react";
import type { PublishResult } from "@standin/contracts";
import { useIsSmallScreen } from "@/features/maps/__shared__/hooks/useIsSmallScreen";
import { EditorStoreProvider } from "@/features/maps/__shared__/components/instances/EditorStoreProvider";
import { EditorStage } from "@/features/maps/__shared__/components/instances/EditorStage";
import { SmallScreenNotice } from "@/features/maps/__shared__/components/views/SmallScreenNotice";
import type { EditorThumbnailTarget } from "@/features/maps/__shared__/types/thumbnail";

type MapEditorPageProps = {
    mapId: string;
    title: string;
    // Where to go when the user leaves. The page that opens the editor knows.
    onExit: () => void;
    // Where the map photo goes when it is missing. Optional: a map without a
    // photo to keep skips it.
    thumbnail?: EditorThumbnailTarget;
    // The menu of actions of whoever owns the map (rename, delete). Optional.
    actions?: ReactNode;
    // Called after each publish that worked. Optional: the template page uses
    // it to renew the map photo.
    onPublished?: (result: PublishResult) => void;
};

// The editor does not know who owns the map. The pages that open it (the
// template one and, later, the space one) resolve the map and the title.
export function MapEditorPage({
    mapId,
    title,
    onExit,
    thumbnail,
    actions,
    onPublished,
}: MapEditorPageProps) {
    const isSmallScreen = useIsSmallScreen();

    if (isSmallScreen) return <SmallScreenNotice />;

    return (
        <EditorStoreProvider key={mapId}>
            <EditorStage
                mapId={mapId}
                title={title}
                onExit={onExit}
                thumbnail={thumbnail}
                actions={actions}
                onPublished={onPublished}
            />
        </EditorStoreProvider>
    );
}
