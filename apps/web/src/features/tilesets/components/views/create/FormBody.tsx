import type { UseFormReturn } from "react-hook-form";
import type { TileMeta } from "@standin/contracts";
import type { ImageSize } from "@/features/assets/queries/useImageSize";
import { TilesetFormFields } from "../../fields/FormFields";
import { TileSheetWorkspace } from "../../instances/editor/Workspace";
import type { CreateTilesetFormValues } from "../../../types/createForm";
import type { TileSheetGrid } from "../../../types/sheet";
import { TilesetUploadStep } from "./UploadStep";

type Props = {
    form: UseFormReturn<CreateTilesetFormValues>;
    file: File | undefined;
    url: string | undefined;
    size: ImageSize | undefined;
    grid: TileSheetGrid | null;
    tileMeta: TileMeta;
    isSubmitting: boolean;
    onFileChosen: (file: File) => void;
};

// What the form of a new tileset shows, by how far along it is: the upload
// step until there is a sheet, only the fields while the sheet does not read
// as a grid, and the editor beside the fields once it does.
export const TilesetFormBody = ({
    form,
    file,
    url,
    size,
    grid,
    tileMeta,
    isSubmitting,
    onFileChosen,
}: Props) => {
    if (!file) {
        return (
            <TilesetUploadStep
                control={form.control}
                disabled={isSubmitting}
                onFileChosen={onFileChosen}
            />
        );
    }

    const fields = (
        <TilesetFormFields
            form={form}
            file={file}
            size={size}
            grid={grid}
            disabled={isSubmitting}
        />
    );
    if (!grid || !url) {
        return <div className="mx-auto w-full max-w-xl">{fields}</div>;
    }

    return (
        <TileSheetWorkspace
            url={url}
            grid={grid}
            meta={tileMeta}
            onChange={(next) =>
                form.setValue("tileMeta", next, { shouldDirty: true })
            }
            savedMeta={null}
            imageInUse={false}
            disabled={isSubmitting}
        >
            {fields}
        </TileSheetWorkspace>
    );
};
