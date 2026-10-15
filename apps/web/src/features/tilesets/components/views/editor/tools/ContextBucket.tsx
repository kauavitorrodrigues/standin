import { getToggleVariant } from "@/features/assets/utils/getToggleVariant";
import { Button } from "@/components/ui/button";
import type { TileTool } from "../../../../types/sheet";
import { getBucketScopeLabel } from "../../../../utils/editor/getBucketScopeLabel";

type Props = {
    tool: TileTool;
    contiguous: boolean;
    onContiguousChange: (contiguous: boolean) => void;
};

// What the bucket fills: only the tiles that touch the one clicked, or every
// tile of the sheet with its category. It is the option of the bucket alone.
export const TileContextBucket = ({
    tool,
    contiguous,
    onContiguousChange,
}: Props) => {
    if (tool !== "bucket") return null;

    return (
        <Button
            type="button"
            size="xs"
            variant={getToggleVariant(contiguous)}
            aria-pressed={contiguous}
            onClick={() => onContiguousChange(!contiguous)}
        >
            {getBucketScopeLabel(contiguous)}
        </Button>
    );
};
