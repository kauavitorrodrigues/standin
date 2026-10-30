import { useClipPreview } from "../../hooks/useClipPreview";
import { useSoundboardSearch } from "../../hooks/useSoundboardSearch";
import type { SpaceSoundboard } from "../../types/space";
import { PanelHeader } from "../views/list/PanelHeader";
import { ClipSearchField } from "../views/list/SearchField";
import { DisabledNotice } from "../views/notice/DisabledNotice";
import { CallTileOverlay } from "./CallTileOverlay";
import { ClipPlaybackProviders } from "./ClipPlaybackProviders";
import { ClipRowsList } from "./ClipRowsList";
import { PANEL_LIST_LAYOUT } from "./listLayouts";
import { ClipUpload } from "./ClipUpload";
import { NoTileActions } from "./NoTileActions";

type Props = { soundboard: SpaceSoundboard };

// The content of the soundboard row: the search and the upload on top, the
// notice, then the groups of clips. Over a tile the person listens alone or
// plays into the call; managing the clips is the manager's job.
export const SoundboardPanel = ({ soundboard }: Props) => {
    const { searchForm, search, hasSearch } = useSoundboardSearch();
    const preview = useClipPreview();

    return (
        <ClipPlaybackProviders playback={soundboard} preview={preview}>
            <div className="flex w-full min-w-0 flex-col gap-2 p-2 text-sm">
                <PanelHeader>
                    <ClipSearchField form={searchForm} />
                    <ClipUpload />
                </PanelHeader>
                <DisabledNotice reason={soundboard.disabledReason} />
                <ClipRowsList
                    search={search}
                    hasSearch={hasSearch}
                    layout={PANEL_LIST_LAYOUT}
                    Overlay={CallTileOverlay}
                    Actions={NoTileActions}
                />
            </div>
        </ClipPlaybackProviders>
    );
};
