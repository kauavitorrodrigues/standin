import { useCreateAvatarPart } from "../../mutations/admin/create";
import { useCreateAvatarVariation } from "../../mutations/admin/createVariation";
import type {
    CreatePartWithPreviewInput,
    CreatePartWithPreviewResult,
} from "../../types/partCreate";

// Creates a part or a color of a part from its sprite and its preview, sent
// together in the same request.
export const useCreatePartWithPreview = () => {
    const createPart = useCreateAvatarPart();
    const createColor = useCreateAvatarVariation();

    const create = async (
        input: CreatePartWithPreviewInput
    ): Promise<CreatePartWithPreviewResult> => {
        switch (input.mode) {
            case "part": {
                const { part } = await createPart.mutateAsync({
                    image: input.image,
                    preview: input.preview,
                    data: input.data,
                });
                return { part };
            }
            case "color": {
                const { part } = await createColor.mutateAsync({
                    baseId: input.baseId,
                    image: input.image,
                    preview: input.preview,
                    data: input.data,
                });
                return { part };
            }
        }
    };

    return {
        create,
        isPending: createPart.isPending || createColor.isPending,
    };
};
