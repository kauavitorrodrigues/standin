import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    AREA_NAME_MAX,
    AreaRenameBodySchema,
    type AreaRenameBody,
    type AreaSummary,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { FormDialogControls } from "@/components/FormDialogControls";
import { toast } from "@/components/ui/toast";
import { getApiError } from "@/features/assets/utils/getApiError";
import { AREA_MESSAGES } from "../../consts/messages";
import { AreasMutations } from "../../mutations";

type Props = {
    area: Pick<AreaSummary, "id" | "name">;
    onDone: () => void;
};

export const RenameAreaForm = ({ area, onDone }: Props) => {
    const rename = AreasMutations.rename();
    const form = useForm<AreaRenameBody>({
        resolver: zodResolver(AreaRenameBodySchema),
        defaultValues: { name: area.name },
    });
    const { isSubmitting } = form.formState;

    const onSubmit = async ({ name }: AreaRenameBody) => {
        try {
            await rename.mutateAsync({ areaId: area.id, name });
            toast.add({ title: AREA_MESSAGES.RENAMED, type: "success" });
            onDone();
        } catch (error) {
            toast.add({
                title:
                    getApiError(error).message ?? AREA_MESSAGES.RENAME_FAILED,
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
                maxLength={AREA_NAME_MAX}
            />
            <FormDialogControls onClose={onDone} isSubmitting={isSubmitting} />
        </form>
    );
};
