import type { AreaSummary } from "@standin/contracts";
import { AreasMutations } from "../mutations";
import type { SaveAreaInput } from "../types/saveAreaInput";

type SaveAreaParams = SaveAreaInput & {
    // The area being edited. Without it a new one is created.
    areaId?: string;
};

// Sends the area to the server: a POST for a new one, a PUT for an existing
// one, both as the PNG plus the name and the stamp. It throws what the request
// throws.
export const useSaveArea = () => {
    const create = AreasMutations.create();
    const replace = AreasMutations.replace();

    const saveArea = ({
        areaId,
        image,
        data,
    }: SaveAreaParams): Promise<AreaSummary> => {
        if (areaId === undefined) return create.mutateAsync({ image, data });
        return replace.mutateAsync({ areaId, image, data });
    };

    return { saveArea, isSaving: create.isPending || replace.isPending };
};
