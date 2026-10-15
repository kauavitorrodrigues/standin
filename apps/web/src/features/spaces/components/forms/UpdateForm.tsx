import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    SpaceUpdateSchema,
    type Space,
    type SpaceUpdateSchemaType,
} from "@standin/contracts";
import { FormDialogControls } from "@/components/FormDialogControls";
import { SpaceFormFields } from "../fields/FormFields";
import { SpaceMutations } from "../../mutations";
import { SpacesQueries } from "../../queries";
import { UpdateMessages } from "./Messages";

type Props = {
    space: Pick<Space, "id" | "name">;
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
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
        >
            <SpaceFormFields form={form} disabled={isSubmitting} />
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
