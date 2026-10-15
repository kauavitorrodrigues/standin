import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useCreateTilesetForm } from "../../hooks/useCreateForm";
import { TilesetFormBody } from "../views/create/FormBody";

// A new tileset. The first step is only the sheet. Then the editor takes the
// area: the fields in the side panel, the sheet under it, where the tiles get
// their categories by selecting or painting.
export const CreateTilesetForm = () => {
    const state = useCreateTilesetForm();

    return (
        <form
            onSubmit={state.submit}
            className="flex min-h-0 w-full flex-1 flex-col gap-6"
        >
            <FormIssues message={state.issuesMessage} />
            <TilesetFormBody
                form={state.form}
                file={state.file}
                url={state.url}
                size={state.size}
                grid={state.grid}
                tileMeta={state.tileMeta}
                isSubmitting={state.isSubmitting}
                onCancel={state.cancel}
                onFileChosen={state.suggestName}
            />
        </form>
    );
};
