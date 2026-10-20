import { useFormContext, useWatch } from "react-hook-form";
import type { AvatarEditorFormValues } from "../../types/draft";
import { SlotParts } from "../instances/SlotParts";

// The parts of the category that is open. Each category mounts its own list,
// so its scroll starts at the top and its pages stay in the cache.
export const PartGridField = () => {
    const { control } = useFormContext<AvatarEditorFormValues>();
    const slot = useWatch({ control, name: "activeSlot" });

    return <SlotParts key={slot} slot={slot} />;
};
