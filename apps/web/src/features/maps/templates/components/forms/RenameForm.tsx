import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    MAX_MAP_TEMPLATE_NAME_LENGTH,
    MapTemplateUpdateSchema,
    type MapTemplate,
    type MapTemplateUpdateSchemaType,
} from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { TextFormField } from "@/components/fields/TextFormField";
import { TEMPLATE_MESSAGES } from "../../consts/messages";
import { TemplateMutations } from "../../mutations";

type Props = {
    template: Pick<MapTemplate, "id" | "name" | "description">;
    onDone: () => void;
};

export const RenameTemplateForm = ({ template, onDone }: Props) => {
    const update = TemplateMutations.update();
    const form = useForm<MapTemplateUpdateSchemaType>({
        resolver: zodResolver(MapTemplateUpdateSchema),
        defaultValues: {
            name: template.name,
            description: template.description,
        },
    });
    const { isSubmitting } = form.formState;

    const onSubmit = async (data: MapTemplateUpdateSchemaType) => {
        try {
            await update.mutateAsync({ ...data, templateId: template.id });
            toast.add({ title: TEMPLATE_MESSAGES.RENAMED, type: "success" });
            onDone();
        } catch {
            toast.add({
                title: TEMPLATE_MESSAGES.RENAME_FAILED,
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
                maxLength={MAX_MAP_TEMPLATE_NAME_LENGTH}
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
