import type { AvatarPartGroup } from "../../../types/parts";
import { canAddVariation } from "../../../utils/admin/canAddVariation";
import { findPartFamily } from "../../../utils/admin/findPartFamily";
import { NewColorForm } from "../../forms/admin/NewColorForm";
import { NewColorHint } from "../../views/admin/NewColorHint";
import { NewColorNotFoundState } from "../../views/admin/NewColorStates";

type Props = {
    slots: readonly AvatarPartGroup[];
    partId: string | undefined;
};

// The form of the part in the URL, or a note when there is none or it does not
// take colors.
export const NewColorBody = ({ slots, partId }: Props) => {
    if (!partId) return <NewColorHint />;

    const family = findPartFamily(slots, partId);
    if (!family || !canAddVariation(family)) return <NewColorNotFoundState />;

    return <NewColorForm key={family.id} family={family} />;
};
