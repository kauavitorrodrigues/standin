import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useCreateTilesetForm } from "../../hooks/useCreateForm";
import { TilesetFormBody } from "../views/create/FormBody";
import { TilesetFormFooter } from "../views/create/FormFooter";

// A new tileset. The first step is only the sheet. Then the page splits in
// two: the fields and what the selected tiles are on the left, the sheet on
// the right, where the tiles get their categories by selecting or painting.
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
                onFileChosen={state.suggestName}
            />
            <TilesetFormFooter
                show={state.file !== undefined}
                canCreate={state.grid !== null}
                isSubmitting={state.isSubmitting}
                onCancel={state.cancel}
            />
        </form>
    );
};
