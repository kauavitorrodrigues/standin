import type { LibraryFamilySummary } from "@standin/contracts";
import { formatLabel } from "@/utils/text";

type Props = { family: LibraryFamilySummary };

// What a family has, at the foot of its card: its variations and, when it has
// them, its colors and rotations, and whether it has parts or is in use.
export const FamilyCounts = ({ family }: Props) => (
    <div className="text-muted-foreground flex w-full flex-wrap gap-x-3 gap-y-1 border-t pt-2 text-xs">
        <span>
            {formatLabel(family.variantCount, "variação", {
                plural: "variações",
            })}
        </span>
        <ColorCount count={family.colorCount} />
        <RotationCount count={family.rotationCount} />
        <PartsFlag show={family.hasParts} />
        <InUseFlag show={family.inUse} />
    </div>
);

const ColorCount = ({ count }: { count: number }) => {
    if (count === 0) return null;
    return <span>{formatLabel(count, "cor", { plural: "cores" })}</span>;
};

const RotationCount = ({ count }: { count: number }) => {
    if (count === 0) return null;
    return <span>{formatLabel(count, "rotação", { plural: "rotações" })}</span>;
};

const PartsFlag = ({ show }: { show: boolean }) => {
    if (!show) return null;
    return <span>Com partes</span>;
};

const InUseFlag = ({ show }: { show: boolean }) => {
    if (!show) return null;
    return <span>Em uso</span>;
};
