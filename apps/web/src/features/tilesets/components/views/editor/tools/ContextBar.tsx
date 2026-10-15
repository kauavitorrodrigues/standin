import { ToolOptionsPanel } from "@/features/editor/components/layout/ToolOptionsPanel";
import { ToolOptionToggle } from "@/features/editor/components/views/ToolOptionToggle";
import type { TileTool } from "../../../../types/sheet";
import { getBucketScopeLabel } from "../../../../utils/editor/getBucketScopeLabel";

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
    <ToolOptionsPanel open={tool === "bucket"}>
        <ToolOptionToggle
            label={getBucketScopeLabel(contiguous)}
            active={contiguous}
            onClick={() => onContiguousChange(!contiguous)}
        />
    </ToolOptionsPanel>
);
