import { getColorSiblings } from "@standin/contracts";
import { Redo2Icon, Undo2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorSwatches } from "@/features/assets/components/views/asset/ColorSwatches";
import { useColorChange } from "@/features/assets/hooks/useColorChange";
import { useMapPalette } from "@/features/assets/queries/useMapPalette";

type Props = {
    mapId: string;
    // The selected placed object: its row and the asset it points at.
    selected: { rowId: string; assetId: string };
    onAssetChanged: (rowId: string, assetId: string) => void;
};

// Color picker of the selected-item bar. The siblings come from the palette
// of the map (the render payload only carries the assets already used in it).
export function SelectedColorPicker({
    mapId,
    selected,
    onAssetChanged,
}: Props) {
    const { assets } = useMapPalette(mapId);
    const { change, undo, redo, canUndo, canRedo, isPending } = useColorChange({
        mapId,
        onAssetChanged,
    });

    const current = assets.find((asset) => asset.id === selected.assetId);
    if (!current) return null;

    const siblings = getColorSiblings(assets, current);
    if (siblings.length < 2) return null;

    return (
        <div className="flex items-center gap-2">
            <ColorSwatches
                siblings={siblings}
                currentId={current.id}
                disabled={isPending}
                onSelect={(asset) =>
                    change(selected.rowId, current.id, asset.id)
                }
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                icon={Undo2Icon}
                aria-label="Desfazer cor"
                disabled={!canUndo || isPending}
                onClick={undo}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                icon={Redo2Icon}
                aria-label="Refazer cor"
                disabled={!canRedo || isPending}
                onClick={redo}
            />
        </div>
    );
}
