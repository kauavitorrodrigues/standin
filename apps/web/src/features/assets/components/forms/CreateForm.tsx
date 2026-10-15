import { FormBody } from "@/features/assets/components/instances/asset/FormBody";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useCreateAssetForm } from "@/features/assets/hooks/useCreateAssetForm";

export const CreateForm = () => {
    const state = useCreateAssetForm();

    return (
        <form
            onSubmit={state.submit}
            className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6"
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
