import type { AssetDefinition } from "@standin/contracts";
import { PickerControl } from "@/components/editor/PickerControl";
import { getAssetImageUrl } from "@/features/maps/__shared__/utils/getAssetImageUrl";
import { preloadImages } from "@/features/maps/__shared__/utils/preloadImages";
import { OBJECT_TOOLBAR_TOOLTIP_OFFSET_PX } from "@/features/maps/__shared__/consts/object-toolbar";
import { ColorSwatches } from "@/features/assets/components/views/asset/ColorSwatches";

type ColorControlProps = {
    show: boolean;
    current: AssetDefinition;
    colors: readonly AssetDefinition[];
    onSelect: (asset: AssetDefinition) => void;
};

// The colors of the current rotation as circles, the current one marked. The
// button shows the color the object has now. Nothing when there is only one.
export const ColorControl = ({
    show,
    current,
    colors,
    onSelect,
}: ColorControlProps) => {
    if (!show) return null;

    // A color swap loads another image for the map, so it is fetched as the
    // pointer reaches the button.
    const handlePreload = () => preloadImages(colors.map(getAssetImageUrl));

    const swatches = [current, ...colors].sort((a, b) =>
        a.id < b.id ? -1 : 1
    );

    return (
        <PickerControl
            tooltipOffset={OBJECT_TOOLBAR_TOOLTIP_OFFSET_PX}
            label="Cor"
            onPreload={handlePreload}
            preview={
                <span
                    className="border-border size-5 rounded-full border"
                    style={{ backgroundColor: current.colorHex ?? undefined }}
                />
            }
            contentClassName="rounded-xl p-3"
        >
            <ColorSwatches
                siblings={swatches}
                currentId={current.id}
                onSelect={onSelect}
            />
        </PickerControl>
    );
};
