import { toast } from "@/components/ui/toast";
import { getAvatarPartErrorMessage } from "../../utils/admin/getAvatarPartErrorMessage";

type Params = {
    perform: () => Promise<unknown>;
    failedMessage: string;
    onDone: () => void;
};

// The confirmation dialogs of a part (delete, remove the back sheet) only
// run an action. Success closes the dialog, a refusal is shown in a toast.
export const useConfirmPartAction = ({
    perform,
    failedMessage,
    onDone,
}: Params) => {
    const confirm = async () => {
        try {
            await perform();
            onDone();
        } catch (error) {
            toast.add({
                title: getAvatarPartErrorMessage(error, failedMessage),
                type: "error",
            });
        }
    };

    return { confirm };
};
