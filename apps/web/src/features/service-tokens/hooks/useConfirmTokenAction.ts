import { toast } from "@/components/ui/toast";
import { getServiceTokenErrorMessage } from "../utils/getServiceTokenErrorMessage";

type Params<Result> = {
    perform: () => Promise<Result>;
    failedMessage: string;
    onDone: (result: Result) => void;
};

// The confirmation dialogs of a token only run an action. Success hands the
// result on, a refusal is shown in a toast.
export const useConfirmTokenAction = <Result>({
    perform,
    failedMessage,
    onDone,
}: Params<Result>) => {
    const confirm = async () => {
        try {
            onDone(await perform());
        } catch (error) {
            toast.add({
                title: getServiceTokenErrorMessage(error, failedMessage),
                type: "error",
            });
        }
    };

    return { confirm };
};
