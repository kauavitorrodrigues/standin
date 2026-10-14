import type { LibraryPaletteArea } from "@standin/contracts";
import { formatAreaSize } from "@/features/editor/utils/formatAreaSize";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";

type AreaCardProps = {
    area: LibraryPaletteArea;
    selected: boolean;
    loading: boolean;
    onPick: (area: LibraryPaletteArea) => void;
};

// An area of the palette: its picture, name and size. Picking it fetches the
// stamp and starts the placing mode, and the card stays marked until Esc.
export const AreaCard = ({
    area,
    selected,
    loading,
    onPick,
}: AreaCardProps) => (
    <button
        type="button"
        aria-pressed={selected}
        aria-busy={loading}
        data-selected={selected}
        onClick={() => onPick(area)}
        className="hover:bg-muted/40 data-[selected=true]:border-primary data-[selected=true]:bg-muted/40 flex flex-col gap-2 rounded-lg border p-2 text-left transition-colors aria-busy:animate-pulse"
    >
        <div className="bg-muted/30 flex h-24 items-center justify-center overflow-hidden rounded-md">
            <img
                src={resolveFileUrl(area.thumbnailUrl, API_BASE_URL)}
                alt={area.name}
                className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
            />
        </div>
        <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium">{area.name}</span>
            <span className="text-muted-foreground text-xs">
                {formatAreaSize(area.width, area.height)}
            </span>
        </div>
    </button>
);
