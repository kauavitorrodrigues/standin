import type { TileTool } from "../../../../types/sheet";
import { FloatingPanel } from "../../../layout/FloatingPanel";
import { TileContextBucket } from "./ContextBucket";

type Props = {
    tool: TileTool;
    contiguous: boolean;
    onContiguousChange: (contiguous: boolean) => void;
};

// The options that are the tool's own, like the context bar of Aseprite: what
// the bucket fills. Only the bucket has any, so the panel is there only with
// it. It sits in the column of the brush, under the categories.
export const TileContextBar = ({
    tool,
    contiguous,
    onContiguousChange,
}: Props) => (
    <FloatingPanel open={tool === "bucket"} className="static p-1.5">
        <TileContextBucket
            tool={tool}
            contiguous={contiguous}
            onContiguousChange={onContiguousChange}
        />
    </FloatingPanel>
);
