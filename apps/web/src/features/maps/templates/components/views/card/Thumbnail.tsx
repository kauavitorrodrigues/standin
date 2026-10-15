import type { MapTemplate } from "@standin/contracts";
import { API_BASE_URL } from "@/lib/api/url";
import { getThumbnailAspectStyle } from "../../../utils/getThumbnailAspectStyle";
import { getThumbnailSrc } from "../../../utils/getThumbnailSrc";
import { ThumbnailPlaceholder } from "./ThumbnailPlaceholder";

type Props = { template: MapTemplate };

// The photo of the map in its real proportion, or a placeholder of the same
// proportion while there is none. It knows nothing about the page around it.
export const TemplateThumbnail = ({ template }: Props) => {
    const src = getThumbnailSrc(template.thumbnailUrl, API_BASE_URL);
    const style = getThumbnailAspectStyle(template.width, template.height);

    if (!src) {
        return (
            <div
                style={{ containerType: "size" }}
                className="bg-muted/30 flex h-40 items-center justify-center overflow-hidden rounded-md"
            >
                <ThumbnailPlaceholder
                    width={template.width}
                    height={template.height}
                />
            </div>
        );
    }

    return (
        <div className="bg-muted/30 flex h-40 items-center justify-center overflow-hidden rounded-md">
            <img
                src={src}
                alt={template.name}
                style={style}
                className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
            />
        </div>
    );
};
