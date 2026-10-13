import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    CreateTilesetData,
    LibraryTilesetSummary,
} from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { buildUploadFormData } from "@/features/assets/utils/buildUploadFormData";
import { invalidateLibrary } from "@/features/assets/utils/invalidateLibrary";

type CreateTilesetInput = { image: File; data: CreateTilesetData };

export const useCreateTileset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            image,
            data,
        }: CreateTilesetInput): Promise<LibraryTilesetSummary> => {
            const res = await api.post(
                "/library/tilesets",
                buildUploadFormData(image, data),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data.tileset;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
