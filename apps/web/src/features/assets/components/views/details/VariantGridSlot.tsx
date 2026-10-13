import type { LibraryFamilyDetail } from "@standin/contracts";
import { VariantGrid } from "./VariantGrid";

type Props = {
    // Not loaded yet, so there is no grid to draw.
    family: LibraryFamilyDetail | undefined;
};

export const VariantGridSlot = ({ family }: Props) => {
    if (!family) return null;
    return <VariantGrid family={family} />;
};
