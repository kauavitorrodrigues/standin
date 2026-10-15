import { useWatch, type UseFormReturn } from "react-hook-form";
import {
    ENABLED_SIZE_TIERS,
    type MapTemplate,
    type SizeTier,
} from "@standin/contracts";
import type { CreateSpaceFormValues } from "../schemas/createSpaceForm";

// The size narrows the maps on offer. Picking a size selects its first map,
// or the blank one when no template has that size.
export const useSpaceSourceSelection = (
    form: UseFormReturn<CreateSpaceFormValues>,
    templates: MapTemplate[]
) => {
    const tier =
        useWatch({ control: form.control, name: "tier" }) ??
        ENABLED_SIZE_TIERS[0];
    const templateId = useWatch({ control: form.control, name: "templateId" });

    const tierTemplates = templates.filter(
        (template) => template.sizeTier === tier
    );

    const selectTier = (next: SizeTier) => {
        const first = templates.find((template) => template.sizeTier === next);
        form.setValue("tier", next);
        form.setValue("templateId", first?.id);
    };

    const selectTemplate = (id: string) => form.setValue("templateId", id);
    const selectBlank = () => form.setValue("templateId", undefined);

    return {
        tier,
        templateId,
        tierTemplates,
        isBlank: !templateId,
        selectTier,
        selectTemplate,
        selectBlank,
    };
};
