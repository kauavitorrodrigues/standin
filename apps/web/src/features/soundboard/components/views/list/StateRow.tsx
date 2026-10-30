import type { ClipStateRow } from "../../../types/row";
import { ClipsErrorRow, ClipsLoadingRow, ClipsMoreRow } from "./StateRows";

type Props = { row: ClipStateRow; onRetry: () => void };

// Why a group has no tiles, or that more are loading.
export const ClipStateRowView = ({ row, onRetry }: Props) => {
    switch (row.state) {
        case "loading":
            return <ClipsLoadingRow />;
        case "error":
        case "more-error":
            return <ClipsErrorRow onRetry={onRetry} />;
        case "more":
            return <ClipsMoreRow />;
    }
};
