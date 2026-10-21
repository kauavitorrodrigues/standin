import { toast } from "@/components/ui/toast";
import { PROFILE_PICTURE_MESSAGES } from "../consts/messages";
import { useRemoveProfilePicture } from "../mutations/removeProfilePicture";
import { useSetProfilePicture } from "../mutations/setProfilePicture";
import { getProfilePictureErrorMessage } from "../utils/getProfilePictureErrorMessage";
import { validateChosenPicture } from "../utils/validateChosenPicture";

// A chosen or dropped photo goes to the server right away, and so does a
// removal. Only one request runs at a time, and the pending flag comes from
// the mutations. A refusal shows an error toast and the previous picture stays;
// a success is not announced, the new picture shows.
export const useProfilePictureUpload = () => {
    const setPicture = useSetProfilePicture();
    const removePicture = useRemoveProfilePicture();
    const isPending = setPicture.isPending || removePicture.isPending;

    const showError = (title: string) => toast.add({ title, type: "error" });

    const upload = async (file: File) => {
        if (isPending) return;

        const issue = await validateChosenPicture(file);
        if (issue) return showError(issue);

        try {
            await setPicture.mutateAsync(file);
        } catch (error) {
            showError(getProfilePictureErrorMessage(error));
        }
    };

    const remove = async () => {
        if (isPending) return;

        try {
            await removePicture.mutateAsync();
        } catch (error) {
            showError(
                getProfilePictureErrorMessage(
                    error,
                    PROFILE_PICTURE_MESSAGES.REMOVE_FAILED
                )
            );
        }
    };

    return { isPending, upload, remove };
};
