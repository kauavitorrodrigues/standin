import type {
    LibraryFamilyDetail,
    LibraryFamilyVariant,
} from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { ASSET_MESSAGES } from "../consts/messages";
import { DELETE_MODES } from "../consts/deleteModes";
import { useDeleteAsset } from "../mutations/delete";
import { getApiError } from "../utils/getApiError";
import { getDeleteMode } from "../utils/getDeleteMode";
import { getDeleteToastTitle } from "../utils/getDeleteToastTitle";

type Params = {
    asset: LibraryFamilyVariant;
    family: Pick<LibraryFamilyDetail, "variants">;
    onOpenChange: (open: boolean) => void;
};

// Deletes an asset, or the whole family when it is a base with variations,
// and tells how it went.
export const useDeleteAssetDialog = ({
    asset,
    family,
    onOpenChange,
}: Params) => {
    const deletion = useDeleteAsset();
    const mode = getDeleteMode(asset, family);
    const isFamily = mode === DELETE_MODES.FAMILY;

    const confirm = async () => {
        try {
            await deletion.mutateAsync({ assetId: asset.id, family: isFamily });
            toast.add({ title: getDeleteToastTitle(mode), type: "success" });
            onOpenChange(false);
        } catch (error) {
            toast.add({
                title:
                    getApiError(error).message ?? ASSET_MESSAGES.DELETE_FAILED,
                type: "error",
            });
        }
    };

    return { isFamily, pending: deletion.isPending, confirm };
};
