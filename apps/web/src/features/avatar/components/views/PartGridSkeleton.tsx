import { Skeleton } from "@/components/ui/skeleton";
import {
    PART_GRID_TILE_SIZE,
    PART_GRID_GAP,
    PART_GRID_ROW_HEIGHT,
} from "../../consts/editor/grid";

const PLACEHOLDERS = 15;

// Shown while the first page of a category loads.
export const PartGridSkeleton = () => (
    <div
        className="grid min-h-0 flex-1 content-start rounded-xl bg-muted p-4"
        style={{
            gridTemplateColumns: `repeat(auto-fill, ${PART_GRID_TILE_SIZE}px)`,
            justifyContent: "space-between",
            gap: PART_GRID_GAP,
        }}
    >
        {Array.from({ length: PLACEHOLDERS }, (_, index) => (
            <Skeleton
                key={index}
                className="rounded-xl bg-background/40"
                style={{ height: PART_GRID_ROW_HEIGHT - PART_GRID_GAP }}
            />
        ))}
    </div>
);
