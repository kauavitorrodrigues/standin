import { STATIC_FRAME_COUNT } from "../../../consts/frames";
import type { AssetDefinition } from "@standin/contracts";
import { getThumbnailStyle } from "@/features/assets/utils/getThumbnailStyle";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";

const THUMBNAIL_BOX_PX = 56;

type Props = {
    asset: AssetDefinition;
    onPick: (asset: AssetDefinition) => void;
    // Shown as picked.
    selected?: boolean;
};

// A family in the palette, shown by its base asset in a square with the name
// under it. The square carries the highlight. Only the base image is
// downloaded here, the variations are fetched when someone selects them.
export function PaletteFamilyButton({
    asset,
    onPick,
    selected = false,
}: Props) {
    return (
        <button
            type="button"
            title={asset.name}
            aria-pressed={selected}
            onClick={() => onPick(asset)}
            className="group flex w-full flex-col items-center gap-1 text-xs outline-none"
        >
            <div className="bg-muted/30 border-border/60 group-hover:bg-muted group-aria-pressed:bg-primary/15 group-aria-pressed:ring-primary group-focus-visible:ring-ring flex aspect-square w-full items-center justify-center rounded-md border group-aria-pressed:ring-2 group-focus-visible:ring-2">
                <div
                    style={getThumbnailStyle(
                        {
                            url: asset.url,
                            sprite: asset.sprite,
                            frameCount:
                                asset.animation?.frameCount ??
                                STATIC_FRAME_COUNT,
                        },
                        resolveFileUrl(asset.url, API_BASE_URL),
                        THUMBNAIL_BOX_PX
                    )}
                />
            </div>
            <span className="line-clamp-2 w-full text-left text-xs leading-tight font-semibold">
                {asset.name}
            </span>
        </button>
    );
}
