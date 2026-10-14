import {
    getFamilyId,
    getReplaceAlternatives,
    type EditorModel,
} from "@standin/contracts";
import type { ObjectToolbarControls } from "@/features/maps/__shared__/types/ObjectToolbarControls";

const MIN_CHOICES = 2;

// Which controls the bar of an object shows. The model and the color lists
// leave the current asset out, so it counts as one more choice: the control
// shows when there are at least two things to pick from. The rotation shows
// when the family has another one. Null when the id is not a placed object.
export const getObjectToolbarControls = (
    model: Readonly<EditorModel>,
    id: string
): ObjectToolbarControls | null => {
    const placed = model.placed.find((item) => item.id === id);
    if (!placed) return null;

    const current = model.library.assets.find(
        (asset) => asset.id === placed.assetId
    );
    if (!current) return null;

    const alternatives = getReplaceAlternatives(model as EditorModel, placed);

    // The place of a model is the place of its family in the library. The
    // variants listed change with the color and the rotation the object has,
    // but the family does not, so the order stays when the object is swapped.
    const familyOrder = new Map<string, number>();
    model.library.assets.forEach((asset, index) => {
        const family = getFamilyId(asset);
        if (!familyOrder.has(family)) familyOrder.set(family, index);
    });
    const modelChoices = [current, ...alternatives.models].sort(
        (a, b) =>
            (familyOrder.get(getFamilyId(a)) ?? 0) -
            (familyOrder.get(getFamilyId(b)) ?? 0)
    );

    return {
        current,
        alternatives,
        modelChoices,
        showModel: alternatives.models.length + 1 >= MIN_CHOICES,
        showColor: alternatives.colors.length + 1 >= MIN_CHOICES,
        showRotate: alternatives.rotations.length > 0,
    };
};
