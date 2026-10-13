import {
    BoxIcon,
    LayersIcon,
    PaletteIcon,
    RotateCwIcon,
    XIcon,
} from "lucide-react";
import type { LibraryFamilySummary } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { AddVariantButton } from "@/features/assets/components/instances/variant/AddVariantButton";
import { FamilyPreview } from "@/features/assets/components/views/card/FamilyPreview";
import { ASSET_CATEGORY_DISPLAY_META } from "@/features/assets/consts/categoryMeta";
import { CellsLabel } from "@/features/assets/components/views/details/CellsLabel";
import { DetailsRow } from "@/features/assets/components/views/details/DetailsRow";
import { FamilyActionsSlot } from "@/features/assets/components/views/details/FamilyActionsSlot";
import { OptionalCountRow } from "@/features/assets/components/views/details/OptionalCountRow";
import { VariantGridSlot } from "@/features/assets/components/views/details/VariantGridSlot";
import {
    PANEL_PREVIEW_BOX_PX,
    PANEL_PREVIEW_MAX_SCALE,
} from "@/features/assets/consts/familyPreview";
import { ASSET_PLACEMENT_META } from "@/features/assets/consts/placementMeta";
import { useLibraryFamily } from "@/features/assets/queries/useLibraryFamily";

type Props = {
    family: LibraryFamilySummary;
    onClose: () => void;
};

// Docked on the right, like the filters on the left: the grid gives it room.
export const FamilyDetailsPanel = ({ family, onClose }: Props) => {
    const category = ASSET_CATEGORY_DISPLAY_META[family.category];
    const placement = ASSET_PLACEMENT_META[family.placement];
    const { footprint } = family;
    const { data: detail } = useLibraryFamily(family.familyId);
    const base = detail?.variants.find(({ id }) => id === family.familyId);

    return (
        <aside className="flex w-96 shrink-0 flex-col overflow-hidden border-l">
            <div className="relative">
                <FamilyPreview
                    thumbnail={family.thumbnail}
                    box={PANEL_PREVIEW_BOX_PX}
                    maxScale={PANEL_PREVIEW_MAX_SCALE}
                    className="h-72 w-full"
                />
                <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    className="absolute top-3 right-3"
                    aria-label="Fechar"
                    onClick={onClose}
                >
                    <XIcon />
                </Button>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <h2 className="truncate text-base font-semibold">
                            {family.name}
                        </h2>
                        <p className="text-muted-foreground truncate text-xs">
                            {family.key}
                        </p>
                    </div>
                    <FamilyActionsSlot base={base} family={detail} />
                </div>
                <div className="flex flex-col gap-3">
                    <DetailsRow
                        icon={category.icon}
                        color={category.color}
                        label="Categoria"
                    >
                        {category.label}
                    </DetailsRow>
                    <DetailsRow
                        icon={placement.icon}
                        color={placement.color}
                        label="Posicionamento"
                    >
                        {placement.label}
                    </DetailsRow>
                    <DetailsRow icon={BoxIcon} label="Pegada">
                        {footprint.w} × {footprint.h}{" "}
                        <CellsLabel cells={footprint.w * footprint.h} />
                    </DetailsRow>
                    <DetailsRow icon={LayersIcon} label="Variações">
                        {family.variantCount}
                    </DetailsRow>
                    <OptionalCountRow
                        icon={PaletteIcon}
                        label="Cores"
                        count={family.colorCount}
                    />
                    <OptionalCountRow
                        icon={RotateCwIcon}
                        label="Rotações"
                        count={family.rotationCount}
                    />
                </div>
                <div className="-mx-4 flex flex-col gap-3 border-t px-4 pt-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-muted-foreground text-xs font-medium uppercase">
                            Variantes
                        </h3>
                        <AddVariantButton family={family} />
                    </div>
                    <VariantGridSlot family={detail} />
                </div>
            </div>
        </aside>
    );
};
