import { useMutation } from "@tanstack/react-query";
import type { PlacedAsset } from "@standin/contracts";
import { api } from "@/lib/axios/api";

type ChangeColorInput = {
    mapId: string;
    rowId: string;
    assetId: string;
};

// The color change is the model swap restricted to a color sibling. Position,
// parent, children and desk link stay as they are.
export const useChangeColor = () =>
    useMutation({
        mutationFn: async ({
            mapId,
            rowId,
            assetId,
        }: ChangeColorInput): Promise<PlacedAsset[]> => {
            const res = await api.patch(`/maps/${mapId}/assets/${rowId}`, {
                assetId,
                colorChange: true,
            });
            return res.data.placed;
        },
    });
