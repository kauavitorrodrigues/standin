import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    MAX_SPACE_NAME_LENGTH,
    SpaceDataSchema,
    type SpaceDataSchemaType,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { FormDialogControls } from "@/components/FormDialogControls";
import { SpaceMutations } from "../../mutations";
import { SpacesQueries } from "../../queries";
import { CreateMessages } from "./Messages";

type Props = {
    onShowDialog: (open: boolean) => void;
};

export const CreateSpaceForm = ({ onShowDialog }: Props) => {
    const createMutation = SpaceMutations.create();
    const spacesQueryUtils = SpacesQueries.useByOrganizationUtils();

    const form = useForm<SpaceDataSchemaType>({
        resolver: zodResolver(SpaceDataSchema),
        defaultValues: { name: "" },
    });

    const onSubmit = async (data: SpaceDataSchemaType) => {
        try {
            await createMutation.mutateAsync(data);
            toast.add({ title: CreateMessages.success, type: "success" });
            spacesQueryUtils.invalidate();
            onShowDialog(false);
        } catch {
            toast.add({ title: CreateMessages.error, type: "error" });
        }
    };

    const { isSubmitting } = form.formState;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <TextFormField
                control={form.control}
                name="name"
                label="Nome"
                required
                placeholder="Nome do espaço"
                disabled={isSubmitting}
                maxLength={MAX_SPACE_NAME_LENGTH}
            />
            <FormDialogControls
                onClose={() => {
                    form.reset();
                    onShowDialog(false);
                }}
                submitLabel="Criar espaço"
                isSubmitting={isSubmitting}
            />
        </form>
    );
};
