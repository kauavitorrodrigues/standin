import type { LibraryFamilyThumbnail } from "@standin/contracts";
import { cn } from "@/lib/utils";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";
import { getThumbnailStyle } from "@/features/assets/utils/getThumbnailStyle";

type Props = {
    thumbnail: LibraryFamilyThumbnail;
    box: number;
    maxScale: number;
    className?: string;
};

// The first frame of the asset PNG over a checkerboard that shows the
// transparency, scaled down to fit the box and never zoomed past maxScale.
export function FamilyPreview({ thumbnail, box, maxScale, className }: Props) {
    return (
        <div
            className={cn(
                "flex items-center justify-center bg-white bg-[length:16px_16px] bg-[image:conic-gradient(#e4e4e7_25%,transparent_0_50%,#e4e4e7_0_75%,transparent_0)] dark:bg-zinc-800 dark:bg-[image:conic-gradient(#3f3f46_25%,transparent_0_50%,#3f3f46_0_75%,transparent_0)]",
                className
            )}
        >
            <div
                style={getThumbnailStyle(
                    thumbnail,
                    resolveFileUrl(thumbnail.url, API_BASE_URL),
                    box,
                    maxScale
                )}
            />
        </div>
    );
}
