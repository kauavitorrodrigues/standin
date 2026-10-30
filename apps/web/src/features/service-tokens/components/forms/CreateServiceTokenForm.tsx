import { SERVICE_TOKEN_NAME_MAX_LENGTH } from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { FormDialogControls } from "@/components/FormDialogControls";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { SERVICE_TOKEN_CREATE_TEXT } from "../../consts/messages";
import { useCreateServiceTokenForm } from "../../hooks/useCreateServiceTokenForm";
import { ExpiryField } from "../fields/ExpiryField";
import { ScopesField } from "../fields/ScopesField";

type Props = { onCreated: (token: string) => void };

export const CreateServiceTokenForm = ({ onCreated }: Props) => {
    const { form, isSubmitting, issuesMessage, submit } =
        useCreateServiceTokenForm({ onCreated });

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <FormIssues message={issuesMessage} />
            {/* Name and expiry share the first row; the date input of a
                specific expiry grows only the right column. */}
            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
                <TextFormField
                    control={form.control}
                    name="name"
                    label={SERVICE_TOKEN_CREATE_TEXT.NAME_LABEL}
                    placeholder={SERVICE_TOKEN_CREATE_TEXT.NAME_PLACEHOLDER}
                    maxLength={SERVICE_TOKEN_NAME_MAX_LENGTH}
                    required
                    disabled={isSubmitting}
                />
                <ExpiryField control={form.control} disabled={isSubmitting} />
            </div>
            <ScopesField control={form.control} disabled={isSubmitting} />
            <FormDialogControls
                isSubmitting={isSubmitting}
                submitLabel={SERVICE_TOKEN_CREATE_TEXT.SUBMIT}
            />
        </form>
    );
};
