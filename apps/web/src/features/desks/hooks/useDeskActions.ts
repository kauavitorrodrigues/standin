import { toast } from "@/components/ui/toast";
import { getApiError } from "@/features/assets/utils/getApiError";
import { DeskMutations } from "../mutations";
import { DESK_MESSAGES } from "../consts/messages";

// Claim, release and assign, with a toast only when one fails. `hasOtherDesk` makes a
// claim a move: the old desk is freed in the same request.
export const useDeskActions = (spaceId: string) => {
    const claim = DeskMutations.claim(spaceId);
    const release = DeskMutations.release(spaceId);
    const assign = DeskMutations.assign(spaceId);

    const claimDesk = async (mapAssetId: string, hasOtherDesk: boolean) => {
        try {
            await claim.mutateAsync({ mapAssetId, swap: hasOtherDesk });
        } catch (error) {
            toast.add({
                title: getApiError(error).message ?? DESK_MESSAGES.CLAIM_FAILED,
                type: "error",
            });
        }
    };

    const releaseDesk = async (mapAssetId: string) => {
        try {
            await release.mutateAsync(mapAssetId);
        } catch (error) {
            toast.add({
                title:
                    getApiError(error).message ?? DESK_MESSAGES.RELEASE_FAILED,
                type: "error",
            });
        }
    };

    const assignDesk = async (mapAssetId: string, userId: string) => {
        try {
            await assign.mutateAsync({ mapAssetId, userId });
            return true;
        } catch (error) {
            toast.add({
                title:
                    getApiError(error).message ?? DESK_MESSAGES.ASSIGN_FAILED,
                type: "error",
            });
            return false;
        }
    };

    return {
        claimDesk,
        releaseDesk,
        assignDesk,
        isPending: claim.isPending || release.isPending || assign.isPending,
    };
};
