import type { MapTemplate } from "@standin/contracts";
import { API_BASE_URL } from "@/lib/api/url";
import { getThumbnailSrc } from "@/features/maps/templates/utils/getThumbnailSrc";

// The photo of the template, shown at once while the map is still loading.
export const TemplateThumbnail = ({ template }: { template: MapTemplate }) => {
    const src = getThumbnailSrc(template.thumbnailUrl, API_BASE_URL);

    if (!src) return null;

    return (
        <img
            src={src}
            alt={template.name}
            decoding="async"
            className="absolute inset-0 size-full object-contain [image-rendering:pixelated]"
        />
    );
};
