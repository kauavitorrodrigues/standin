import type { UseFormReturn } from "react-hook-form";
import type { TileMeta } from "@standin/contracts";
import type { ImageSize } from "@/features/assets/queries/useImageSize";
import { TilesetFormFields } from "../../fields/FormFields";
import { TileSheetWorkspace } from "../../instances/editor/Workspace";
import type { CreateTilesetFormValues } from "../../../types/createForm";
import type { TileSheetGrid } from "../../../types/sheet";
import { TilesetCreateFrame } from "./Frame";
import { TilesetFormFooter } from "./FormFooter";
import { TilesetUploadStep } from "./UploadStep";

type Props = {
    form: UseFormReturn<CreateTilesetFormValues>;
    file: File | undefined;
    url: string | undefined;
    size: ImageSize | undefined;
    grid: TileSheetGrid | null;
    tileMeta: TileMeta;
    isSubmitting: boolean;
    onCancel: () => void;
    onFileChosen: (file: File) => void;
};

// What the form of a new tileset shows, by how far along it is: the upload
// step until there is a sheet, only the fields while the sheet does not read
// as a grid, and the editor over the whole area once it does, with the fields
// in its side panel.
export const TilesetFormBody = ({
    form,
    file,
    url,
    size,
    grid,
    tileMeta,
    isSubmitting,
    onCancel,
    onFileChosen,
}: Props) => {
    if (!file) {
        return (
            <TilesetCreateFrame>
                <TilesetUploadStep
                    control={form.control}
                    disabled={isSubmitting}
                    onFileChosen={onFileChosen}
                />
            </TilesetCreateFrame>
        );
    }

    const removeImage = () => {
        form.setValue("image", []);
        form.setValue("tileMeta", {});
    };

    const fields = (
        <TilesetFormFields
            form={form}
            size={size}
            grid={grid}
            disabled={isSubmitting}
        />
    );
    const footer = (
        <TilesetFormFooter
            show
            canCreate={grid !== null}
            isSubmitting={isSubmitting}
            onCancel={onCancel}
        />
    );
    if (!grid || !url) {
        return (
            <TilesetCreateFrame>
                <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
                    {fields}
                    <div className="flex justify-end gap-2">{footer}</div>
                </div>
            </TilesetCreateFrame>
        );
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
            title="Novo tileset"
            onExit={onCancel}
            actions={footer}
            onRemoveImage={removeImage}
        >
            {fields}
        </TileSheetWorkspace>
    );
};
