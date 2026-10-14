import type { AssetDefinition } from "@standin/contracts";
import { getAssetImageUrl } from "@/features/editor/utils/getAssetImageUrl";
import { getThumbnailSizes } from "@/features/editor/utils/getThumbnailSizes";
import { markThumbnailLoaded } from "@/features/editor/utils/markThumbnailLoaded";

type AssetThumbnailProps = {
    asset: AssetDefinition;
    boxPx: number;
    // Lazy waits for the image to near the screen (a list that scrolls). Eager
    // is for one that is already in view.
    loading?: "lazy" | "eager";
};

// The first frame of the asset image, scaled into a square box. A pulse holds
// its place until the image arrives, and the image fades in, so a slow load
// never shows an empty hole. The frame is keyed by the asset, so a swap starts
// the placeholder again.
export const AssetThumbnail = ({
    asset,
    boxPx,
    loading = "eager",
}: AssetThumbnailProps) => {
    const { frame, strip } = getThumbnailSizes(asset, boxPx);

    return (
        <div
            className="flex items-center justify-center"
            style={{ width: boxPx, height: boxPx }}
        >
            <div
                key={asset.id}
                className="bg-muted/60 group animate-pulse overflow-hidden rounded-sm data-[loaded=true]:animate-none data-[loaded=true]:bg-transparent"
                style={{ width: frame.width, height: frame.height }}
            >
                <img
                    ref={markThumbnailLoaded}
                    src={getAssetImageUrl(asset)}
                    alt=""
                    loading={loading}
                    decoding="async"
                    draggable={false}
                    onLoad={(event) => markThumbnailLoaded(event.currentTarget)}
                    onError={(event) =>
                        markThumbnailLoaded(event.currentTarget)
                    }
                    className="max-w-none opacity-0 transition-opacity duration-150 [[data-loaded=true]>&]:opacity-100"
                    style={{
                        width: strip.width,
                        height: strip.height,
                        imageRendering: "pixelated",
                    }}
                />
            </div>
        </div>
    );
};
