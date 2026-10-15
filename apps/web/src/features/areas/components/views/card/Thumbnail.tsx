import type { AreaSummary } from "@standin/contracts";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";

type Props = { area: Pick<AreaSummary, "name" | "thumbnailUrl"> };

// The picture of the area at its native resolution, kept crisp.
export const AreaThumbnail = ({ area }: Props) => (
    <div className="bg-muted/30 flex h-40 items-center justify-center overflow-hidden rounded-md">
        <img
            src={resolveFileUrl(area.thumbnailUrl, API_BASE_URL)}
            alt={area.name}
            className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
        />
    </div>
);
