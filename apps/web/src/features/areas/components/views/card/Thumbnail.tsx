import type { AreaSummary } from "@standin/contracts";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";

type Props = { area: Pick<AreaSummary, "name" | "thumbnailUrl"> };

// The picture of the area, saved at its native resolution. The card shows it
// smaller than that, and a pixelated shrink to a non-integer scale drops pixels
// at random (the dark marks of the floor tiles turn into dashes), so the browser
// smooths it down instead.
export const AreaThumbnail = ({ area }: Props) => (
    <div className="bg-muted/30 flex h-40 items-center justify-center overflow-hidden rounded-md">
        <img
            src={resolveFileUrl(area.thumbnailUrl, API_BASE_URL)}
            alt={area.name}
            className="max-h-full max-w-full object-contain"
        />
    </div>
);
