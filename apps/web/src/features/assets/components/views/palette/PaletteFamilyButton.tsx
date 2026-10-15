import { STATIC_FRAME_COUNT } from "../../../consts/frames";
import type { AssetDefinition } from "@standin/contracts";
import { getThumbnailStyle } from "@/features/assets/utils/getThumbnailStyle";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";

const THUMBNAIL_BOX_PX = 40;

type Props = {
    asset: AssetDefinition;
    onPick: (asset: AssetDefinition) => void;
};

// A family in the palette, shown by its base asset. Only the base image is
// downloaded here, the variations are fetched when someone selects them.
export function PaletteFamilyButton({ asset, onPick }: Props) {
    return (
        <button
            type="button"
            title={asset.name}
            onClick={() => onPick(asset)}
            className="hover:bg-muted flex w-20 flex-col items-center gap-1 rounded-md p-2 text-xs"
        >
            <div className="flex size-10 items-center justify-center">
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
            <span className="w-full truncate text-center">{asset.name}</span>
        </button>
    );
}
