import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    MAX_ORGANIZATION_NAME_LENGTH,
    OrganizationDataSchema,
    type OrganizationDataSchemaType,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { FormDialogControls } from "@/components/FormDialogControls";
import { OrganizationMutations } from "../../mutations";
import { OrganizationsQueries } from "../../queries";
import { useOrganization } from "../../hooks/useOrganization";
import { CreateMessages } from "./Messages";

type Props = {
    onShowDialog: (open: boolean) => void;
};

export const CreateOrganizationForm = ({ onShowDialog }: Props) => {
    const createMutation = OrganizationMutations.create();
    const organizationsQueryUtils = OrganizationsQueries.useAllUtils();
    const { setOrganization } = useOrganization();

    const form = useForm<OrganizationDataSchemaType>({
        resolver: zodResolver(OrganizationDataSchema),
        defaultValues: { name: "" },
    });

    const onSubmit = async (data: OrganizationDataSchemaType) => {
        try {
            const organization = await createMutation.mutateAsync(data);
            toast.add({ title: CreateMessages.success, type: "success" });
            organizationsQueryUtils.invalidate();
            setOrganization(organization);
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
                placeholder="Nome da organização"
                disabled={isSubmitting}
                maxLength={MAX_ORGANIZATION_NAME_LENGTH}
            />
            <FormDialogControls
                onClose={() => {
                    form.reset();
                    onShowDialog(false);
                }}
                submitLabel="Criar organização"
                isSubmitting={isSubmitting}
            />
        </form>
    );
};
