import type {
    LibraryFamilyDetail,
    LibraryFamilyVariant,
} from "@standin/contracts";
import { FamilyActions } from "@/features/assets/components/instances/family/FamilyActions";

type Props = {
    // Not loaded yet, so there is nothing to act on.
    base: LibraryFamilyVariant | undefined;
    family: LibraryFamilyDetail | undefined;
};

export const FamilyActionsSlot = ({ base, family }: Props) => {
    if (!base || !family) return null;
    return <FamilyActions base={base} family={family} />;
};
