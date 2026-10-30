import type { ClipPanelStateRow } from "../../../types/row";
import { PanelEmptyState, PanelNoResultsState } from "./PanelStates";

type Props = { row: ClipPanelStateRow };

// Why the whole panel has no clips: there are none, or none match the search.
export const PanelStateRowView = ({ row }: Props) => {
    switch (row.state) {
        case "empty":
            return <PanelEmptyState />;
        case "no-results":
            return <PanelNoResultsState />;
    }
};
