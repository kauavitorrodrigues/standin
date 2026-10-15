import { useForm } from "react-hook-form";
import type { LibraryTilesetSummary } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { TextFormField } from "@/components/fields/TextFormField";
import { getApiError } from "@/features/assets/utils/getApiError";
import { TILESET_MESSAGES } from "../../consts/messages";
import { TILESET_VALIDATION_MESSAGES } from "../../consts/validationMessages";
import { useRenameTileset } from "../../mutations/rename";
import type { RenameTilesetFormValues } from "../../types/renameForm";

type Props = {
    tileset: Pick<LibraryTilesetSummary, "id" | "name">;
    onDone: () => void;
};

export const RenameTilesetForm = ({ tileset, onDone }: Props) => {
    const rename = useRenameTileset();
    const form = useForm<RenameTilesetFormValues>({
        defaultValues: { name: tileset.name },
    });
    const { isSubmitting } = form.formState;

    const onSubmit = async ({ name }: RenameTilesetFormValues) => {
        if (name.trim() === "") {
            form.setError("name", {
                message: TILESET_VALIDATION_MESSAGES.REQUIRED,
            });
            return;
        }
        try {
            await rename.mutateAsync({
                tilesetId: tileset.id,
                name: name.trim(),
            });
            toast.add({ title: TILESET_MESSAGES.RENAMED, type: "success" });
            onDone();
        } catch (error) {
            toast.add({
                title:
                    getApiError(error).message ??
                    TILESET_MESSAGES.RENAME_FAILED,
                type: "error",
            });
        }
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
        >
            <TextFormField
                control={form.control}
                name="name"
                label="Nome"
                required
                disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={onDone}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    Salvar
                </Button>
            </div>
        </form>
    );
};
