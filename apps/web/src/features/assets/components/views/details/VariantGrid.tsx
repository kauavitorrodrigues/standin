import { ASSET_ROTATIONS } from "@standin/contracts";
import type { LibraryFamilyDetail } from "@standin/contracts";
import { ColorRowName } from "./ColorRowName";
import { VariantGridCell } from "./VariantGridCell";
import { ROTATION_OPTIONS } from "@/features/assets/consts/rotationMeta";

type Props = {
    family: LibraryFamilyDetail;
};

// A variation with no rotation is shown as the unrotated one.
const getRotationLabel = (
    rotation: LibraryFamilyDetail["grid"]["columns"][number]
) =>
    ROTATION_OPTIONS.find(
        ({ value }) => value === (rotation ?? ASSET_ROTATIONS.DEG_0)
    )?.label;

// Colors down, rotations across, one image per cell.
export const VariantGrid = ({ family }: Props) => {
    const { columns, rows } = family.grid;

    return (
        <div
            className="grid w-fit items-center gap-2"
            style={{
                gridTemplateColumns: `auto repeat(${columns.length}, 3.5rem)`,
            }}
        >
            <span />
            {columns.map((rotation) => (
                <span
                    key={rotation ?? "none"}
                    className="text-muted-foreground text-center text-xs"
                >
                    {getRotationLabel(rotation)}
                </span>
            ))}
            {rows.map((row) => (
                <div key={row.color?.key ?? "none"} className="contents">
                    <span className="flex items-center gap-2 pr-1 text-sm">
                        <span
                            aria-hidden
                            className="border-border size-3 shrink-0 rounded-full border"
                            style={{ backgroundColor: row.color?.hex }}
                        />
                        <ColorRowName colorKey={row.color?.key} />
                    </span>
                    {row.cells.map((variant, index) => (
                        <VariantGridCell
                            key={variant?.id ?? columns[index] ?? "none"}
                            variant={variant}
                            family={family}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};
