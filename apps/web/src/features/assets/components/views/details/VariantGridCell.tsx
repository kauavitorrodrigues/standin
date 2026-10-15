import type {
    LibraryFamilyDetail,
    LibraryFamilyVariant,
} from "@standin/contracts";
import { VariantActions } from "@/features/assets/components/instances/variant/VariantActions";
import { FamilyPreview } from "@/features/assets/components/views/card/FamilyPreview";
import {
    CELL_PREVIEW_BOX_PX,
    CELL_PREVIEW_MAX_SCALE,
} from "@/features/assets/consts/familyPreview";

type Props = {
    // Null where the family has no such color and rotation.
    variant: LibraryFamilyVariant | null;
    family: LibraryFamilyDetail;
};

// One cell of the grid: the image of the variation with its menu, or an empty
// dashed one where the family has none.
export const VariantGridCell = ({ variant, family }: Props) => {
    if (!variant) {
        return <div className="h-14 rounded-md border border-dashed" />;
    }

    return (
        <div className="group/cell relative overflow-hidden rounded-md border">
            <FamilyPreview
                thumbnail={variant.thumbnail}
                box={CELL_PREVIEW_BOX_PX}
                maxScale={CELL_PREVIEW_MAX_SCALE}
                className="h-14 w-full"
            />
            <VariantActions variant={variant} family={family} />
        </div>
    );
};
