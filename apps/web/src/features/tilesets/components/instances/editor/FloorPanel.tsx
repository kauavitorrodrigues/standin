import type { FloorMaterial } from "@standin/contracts";
import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";
import { getFloorSelection } from "../../../utils/editor/getFloorSelection";
import { FLOOR_MATERIAL_OPTIONS } from "../../../consts/floorMaterialMeta";
import { cn } from "@/lib/utils";

// What a floor tile sounds like under the feet. It shows when a floor is
// selected, and the pick goes to every floor selected. It is open also to the
// tiles that maps already use, since it does not change what they are.
export const TileFloorPanel = () => {
    const { meta, selected, setMaterial, disabled } = useTileEditorContext();
    const { floors, material } = getFloorSelection(meta, selected);
    if (floors.length === 0) return null;

    const pick = (next: FloorMaterial) => setMaterial(next);

    return (
        <section className="border-border flex flex-col gap-3 border-t pt-4">
            <h3 className="text-sm font-semibold">Piso</h3>
            <div
                role="radiogroup"
                aria-label="Material do piso"
                className="grid grid-cols-2 gap-2"
            >
                {FLOOR_MATERIAL_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={material === option.value}
                        disabled={disabled}
                        onClick={() => pick(option.value)}
                        className={cn(
                            "border-border hover:bg-muted rounded-md border px-3 py-2 text-sm disabled:pointer-events-none disabled:opacity-50",
                            material === option.value &&
                                "border-primary bg-muted font-medium"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </section>
    );
};
