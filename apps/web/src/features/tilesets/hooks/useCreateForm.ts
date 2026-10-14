import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast";
import { useObjectUrl } from "@/features/assets/hooks/useObjectUrl";
import { useImageSize } from "@/features/assets/queries/useImageSize";
import { applyApiErrorWithFallback } from "@/features/assets/utils/applyApiErrorWithFallback";
import {
    getFileBaseName,
    toDisplayName,
} from "@/features/assets/utils/deriveAssetNames";
import { validateUploadFile } from "@/features/assets/utils/validateUploadFile";
import { CREATE_TILESET_DEFAULT_VALUES } from "../consts/createForm";
import { TILESET_MESSAGES } from "../consts/messages";
import { useCreateTileset } from "../mutations/create";
import type { CreateTilesetFormValues } from "../types/createForm";
import { buildTilesetData } from "../utils/buildData";
import { getTilesetGrid } from "../utils/grid/getGrid";
import { validateCreateTileset } from "../utils/validateCreate";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";

// Everything the form of a new tileset does: reads the grid from the sheet as
// the margin and the spacing are typed, suggests the name from the file,
// checks what saves a round trip and sends the tileset.
export const useCreateTilesetForm = () => {
    const { paths } = useLibraryScope();
    const navigate = useNavigate();
    const createTileset = useCreateTileset();

    const form = useForm<CreateTilesetFormValues>({
        defaultValues: CREATE_TILESET_DEFAULT_VALUES,
    });
    const [images, margin, spacing, tileMeta] = useWatch({
        control: form.control,
        name: ["image", "margin", "spacing", "tileMeta"],
    });
    const [file] = images;
    const url = useObjectUrl(file);
    const { data: size } = useImageSize(file);
    const grid = size ? getTilesetGrid(size, margin ?? 0, spacing ?? 0) : null;

    // The tileset takes the name of the file until the user writes another one.
    const suggestName = (chosen: File) => {
        if (form.getValues("name").trim()) return;
        form.setValue("name", toDisplayName(getFileBaseName(chosen.name)));
    };

    const onSubmit = async (values: CreateTilesetFormValues) => {
        const errors = validateCreateTileset(values, grid);
        const [image] = values.image;
        if (image) {
            const message = await validateUploadFile(image);
            if (message) errors.image = message;
        }
        const fields = Object.keys(errors) as (keyof CreateTilesetFormValues)[];
        if (fields.length > 0 || !image || !grid) {
            for (const field of fields) {
                form.setError(field, { message: errors[field] });
            }
            return;
        }

        try {
            await createTileset.mutateAsync({
                image,
                data: buildTilesetData(values, grid.tileCount),
            });
            toast.add({ title: TILESET_MESSAGES.CREATED, type: "success" });
            navigate({ to: paths.tilesets });
        } catch (error) {
            applyApiErrorWithFallback(
                error,
                form.setError,
                TILESET_MESSAGES.CREATE_FAILED
            );
        }
    };

    return {
        form,
        file,
        url,
        size,
        grid,
        tileMeta,
        isSubmitting: form.formState.isSubmitting,
        issuesMessage: form.formState.errors.root?.message,
        suggestName,
        submit: form.handleSubmit(onSubmit),
        cancel: () => navigate({ to: paths.tilesets }),
    };
};
