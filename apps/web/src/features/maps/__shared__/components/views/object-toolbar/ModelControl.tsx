import type { AssetDefinition } from "@standin/contracts";
import { PickerControl } from "@/components/editor/PickerControl";
import {
    OBJECT_TOOLBAR_PRELOAD_LIMIT,
    OBJECT_TOOLBAR_TOOLTIP_OFFSET_PX,
} from "@/features/maps/__shared__/consts/object-toolbar";
import { centerPressedChild } from "@/features/maps/__shared__/utils/centerPressedChild";
import { getAssetImageUrl } from "@/features/maps/__shared__/utils/getAssetImageUrl";
import { preloadImages } from "@/features/maps/__shared__/utils/preloadImages";
import { AssetThumbnail } from "@/features/maps/__shared__/components/views/object-toolbar/AssetThumbnail";

const BUTTON_THUMBNAIL_PX = 24;
const GRID_THUMBNAIL_PX = 48;

type ModelControlProps = {
    show: boolean;
    current: AssetDefinition;
    // Every choice, the current one included, in a fixed order.
    models: readonly AssetDefinition[];
    onSelect: (asset: AssetDefinition) => void;
};

// Swaps the object for another model of the same kind. The button shows the
// model it has now, and the popover a grid of the choices, pictures only, in
// a fixed order with the current one marked. The popover opens already
// scrolled to the current one. The padding is inside the scroll area so
// the ring of the current one is never cut by its edge. Nothing when there is none.
export const ModelControl = ({
    show,
    current,
    models,
    onSelect,
}: ModelControlProps) => {
    if (!show) return null;

    // The popover opens scrolled to the current model, so the ones around it
    // are the ones that show first.
    const handlePreload = () => {
        const index = models.findIndex((asset) => asset.id === current.id);
        const start = Math.max(0, index - OBJECT_TOOLBAR_PRELOAD_LIMIT / 2);
        preloadImages(
            models
                .slice(start, start + OBJECT_TOOLBAR_PRELOAD_LIMIT)
                .map(getAssetImageUrl)
        );
    };

    return (
        <PickerControl
            tooltipOffset={OBJECT_TOOLBAR_TOOLTIP_OFFSET_PX}
            label="Modelo"
            preview={
                <AssetThumbnail asset={current} boxPx={BUTTON_THUMBNAIL_PX} />
            }
            onPreload={handlePreload}
            contentClassName="p-0"
        >
            <div
                ref={centerPressedChild}
                className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto p-3"
            >
                {models.map((asset) => (
                    <button
                        key={asset.id}
                        type="button"
                        aria-label={asset.name}
                        aria-pressed={asset.id === current.id}
                        disabled={asset.id === current.id}
                        onClick={() => onSelect(asset)}
                        className="hover:bg-muted/60 aria-pressed:bg-muted aria-pressed:ring-muted-foreground/50 flex size-16 items-center justify-center rounded-lg aria-pressed:ring-2 disabled:cursor-default"
                    >
                        <AssetThumbnail
                            asset={asset}
                            boxPx={GRID_THUMBNAIL_PX}
                            loading="lazy"
                        />
                    </button>
                ))}
            </div>
        </PickerControl>
    );
};
