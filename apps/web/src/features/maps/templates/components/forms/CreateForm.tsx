import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ENABLED_SIZE_TIERS,
    MapTemplateDataSchema,
    type MapTemplateDataSchemaType,
} from "@standin/contracts";
import { FormDialogControls } from "@/components/FormDialogControls";
import { toast } from "@/components/ui/toast";
import { TEMPLATE_MESSAGES } from "../../consts/messages";
import { TemplateMutations } from "../../mutations";
import { TemplateFormFields } from "../fields/FormFields";

type Props = {
    onShowDialog: (open: boolean) => void;
};

export const CreateTemplateForm = ({ onShowDialog }: Props) => {
    const navigate = useNavigate();
    const createMutation = TemplateMutations.create();

    const form = useForm<MapTemplateDataSchemaType>({
        resolver: zodResolver(MapTemplateDataSchema),
        defaultValues: {
            name: "",
            description: "",
            sizeTier: ENABLED_SIZE_TIERS[0],
        },
    });

    const onSubmit = async (data: MapTemplateDataSchemaType) => {
        try {
            const result = await createMutation.mutateAsync(data);
            toast.add({ title: TEMPLATE_MESSAGES.CREATED, type: "success" });
            form.reset();
            onShowDialog(false);
            navigate({
                to: "/admin/maps/$templateId/edit",
                params: { templateId: result.templateId },
            }).catch(() => undefined);
        } catch {
            toast.add({
                title: TEMPLATE_MESSAGES.CREATE_FAILED,
                type: "error",
            });
        }
    };

    const { isSubmitting } = form.formState;

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
        >
            <TemplateFormFields form={form} disabled={isSubmitting} />
            <FormDialogControls
                onClose={() => {
                    form.reset();
                    onShowDialog(false);
                }}
                submitLabel="Criar template"
                isSubmitting={isSubmitting}
            />
        </form>
    );
};
