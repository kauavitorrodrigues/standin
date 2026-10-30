import { cn } from "@/lib/utils";
import { formatSelection } from "../../../utils/formatSelection";

type Props = { durationMs: number; isOver: boolean };

// The length of the selection. It turns red when the clip would be too long
// or too big to be sent.
export const SelectionDuration = ({ durationMs, isOver }: Props) => {
    const className = cn(
        "text-xs tabular-nums",
        isOver ? "text-destructive" : "text-muted-foreground"
    );

    return <span className={className}>{formatSelection(durationMs)}</span>;
};
