import { FormBody } from "@/features/assets/components/instances/asset/FormBody";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useCreateAssetForm } from "@/features/assets/hooks/useCreateAssetForm";

export const CreateForm = () => {
    const state = useCreateAssetForm();

    return (
        <form
            onSubmit={state.submit}
            className="flex min-h-0 w-full flex-1 flex-col gap-4"
        >
            <FormIssues message={state.issuesMessage} />
            <FormBody
                form={state.form}
                file={state.file}
                isSubmitting={state.isSubmitting}
                onFileChosen={state.suggestName}
                onCancel={state.cancel}
            />
        </form>
    );
};
