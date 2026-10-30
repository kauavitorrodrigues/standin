import { useForm } from "react-hook-form";
import { DEFAULT_EXPIRY_OPTION } from "../consts/expiryOptions";
import { SERVICE_TOKEN_ERROR_MESSAGES } from "../consts/messages";
import { useCreateServiceToken } from "../mutations/useCreateServiceToken";
import type { CreateTokenFormValues } from "../types";
import { getServiceTokenErrorMessage } from "../utils/getServiceTokenErrorMessage";
import { validateCreateToken } from "../utils/validateCreateToken";

type Params = { onCreated: (token: string) => void };

const EMPTY_VALUES: CreateTokenFormValues = {
    name: "",
    scopes: [],
    expiry: DEFAULT_EXPIRY_OPTION,
    expiresOn: "",
};

// The form of a new token. The clear token goes to `onCreated` and nowhere
// alone: the mutation is reset so it does not keep it either.
export const useCreateServiceTokenForm = ({ onCreated }: Params) => {
    const createToken = useCreateServiceToken();
    const form = useForm<CreateTokenFormValues>({
        defaultValues: EMPTY_VALUES,
    });

    const onSubmit = async (values: CreateTokenFormValues) => {
        const validation = validateCreateToken(values);
        if (!validation.ok) {
            for (const [field, message] of Object.entries(validation.errors)) {
                form.setError(field as keyof CreateTokenFormValues, {
                    message,
                });
            }
            return;
        }

        try {
            const token = await createToken.mutateAsync(validation.payload);
            createToken.reset();
            form.reset(EMPTY_VALUES);
            onCreated(token);
        } catch (error) {
            form.setError("root", {
                message: getServiceTokenErrorMessage(
                    error,
                    SERVICE_TOKEN_ERROR_MESSAGES.CREATE_FAILED
                ),
            });
        }
    };

    return {
        form,
        isSubmitting: form.formState.isSubmitting,
        issuesMessage: form.formState.errors.root?.message,
        submit: form.handleSubmit(onSubmit),
    };
};
