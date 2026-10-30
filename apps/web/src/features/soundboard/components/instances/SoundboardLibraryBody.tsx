import type { ReactNode } from "react";
import { useSoundboardSearch } from "../../hooks/useSoundboardSearch";
import { PanelHeader } from "../views/list/PanelHeader";
import { ClipSearchField } from "../views/list/SearchField";
import { PANEL_LIST_LAYOUT } from "./listLayouts";
import { SoundboardLibraryContent } from "./SoundboardLibraryContent";

type Props = {
    // What sits beside the search: the upload button where the screen has no
    // header of its own to hold it.
    actions?: ReactNode;
};

// The library to manage inside the dialog of a space: its own search above
// the groups of clips, shown as tiles. The pages of the library have their
// search in the header instead, and show the clips as a table or cards.
export const SoundboardLibraryBody = ({ actions }: Props) => {
    const { searchForm, search, hasSearch } = useSoundboardSearch();

    return (
        <div className="flex w-full min-w-0 flex-col gap-3">
            <PanelHeader>
                <ClipSearchField form={searchForm} />
                {actions}
            </PanelHeader>
            <SoundboardLibraryContent
                search={search}
                hasSearch={hasSearch}
                layout={PANEL_LIST_LAYOUT}
            />
        </div>
    );
};
