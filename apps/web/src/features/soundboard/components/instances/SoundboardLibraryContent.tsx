import type { ClipListLayout } from "../../types/layout";
import { useClipPreview } from "../../hooks/useClipPreview";
import { ClipPlaybackProviders } from "./ClipPlaybackProviders";
import { ClipRowsList } from "./ClipRowsList";
import { ManageTileOverlay } from "./ManageTileOverlay";
import { NoTileActions } from "./NoTileActions";

type Props = {
    search: string;
    hasSearch: boolean;
    layout: ClipListLayout;
};

// The groups of clips to manage, in the layout given, with the local listening
// every tile of it shares. A tile only listens to its clip on your own
// speakers, and has edit and delete where the server says you may. Nothing
// here is sent to a call.
export const SoundboardLibraryContent = ({
    search,
    hasSearch,
    layout,
}: Props) => {
    const preview = useClipPreview();

    return (
        <ClipPlaybackProviders playback={preview} preview={preview}>
            <ClipRowsList
                search={search}
                hasSearch={hasSearch}
                layout={layout}
                Overlay={ManageTileOverlay}
                Actions={NoTileActions}
            />
        </ClipPlaybackProviders>
    );
};
