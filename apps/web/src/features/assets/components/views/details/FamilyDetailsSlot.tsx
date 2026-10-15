import type { LibraryFamilySummary } from "@standin/contracts";
import { FamilyDetailsPanel } from "./FamilyDetailsPanel";

type Props = {
    // The last family shown, kept while the panel slides out.
    family: LibraryFamilySummary | undefined;
    onClose: () => void;
};

export const FamilyDetailsSlot = ({ family, onClose }: Props) => {
    if (!family) return null;
    return <FamilyDetailsPanel family={family} onClose={onClose} />;
};
