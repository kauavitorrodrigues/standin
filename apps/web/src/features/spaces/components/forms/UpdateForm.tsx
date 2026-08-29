import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    MAX_SPACE_NAME_LENGTH,
    SpaceUpdateSchema,
    type Space,
    type SpaceUpdateSchemaType,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { FormDialogControls } from "@/components/FormDialogControls";
import { SpaceMutations } from "../../mutations";
import { SpacesQueries } from "../../queries";
import { UpdateMessages } from "./Messages";

type Props = {
    space: Space;
    onShowDialog: (open: boolean) => void;
};

export const UpdateSpaceForm = ({ space, onShowDialog }: Props) => {
    const updateMutation = SpaceMutations.update();
    const spacesQueryUtils = SpacesQueries.useByOrganizationUtils();

    const form = useForm<SpaceUpdateSchemaType>({
        resolver: zodResolver(SpaceUpdateSchema),
        defaultValues: { name: space.name },
    });

    const onSubmit = async (data: SpaceUpdateSchemaType) => {
        try {
            await updateMutation.mutateAsync({ id: space.id, ...data });
            toast.add({ title: UpdateMessages.success, type: "success" });
            spacesQueryUtils.invalidate();
            onShowDialog(false);
        } catch {
            toast.add({ title: UpdateMessages.error, type: "error" });
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
                submitLabel="Salvar"
                isSubmitting={isSubmitting}
            />
        </form>
    );
};
