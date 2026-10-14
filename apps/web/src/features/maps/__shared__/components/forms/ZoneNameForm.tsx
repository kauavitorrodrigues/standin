import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { TextFormField } from "@/components/fields/TextFormField";
import {
    zoneNameSchema,
    type ZoneNameValues,
} from "@/features/maps/__shared__/schemas/zone-name.schema";

type ZoneNameFormProps = {
    onConfirm: (label: string) => void;
    onCancel: () => void;
};

// The name of the area just drawn. It is required.
export const ZoneNameForm = ({ onConfirm, onCancel }: ZoneNameFormProps) => {
    const form = useForm<ZoneNameValues>({
        resolver: zodResolver(zoneNameSchema),
        defaultValues: { label: "" },
    });

    const onSubmit = (values: ZoneNameValues) => onConfirm(values.label);

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-64 flex-col gap-3 p-3"
        >
            <TextFormField
                control={form.control}
                name="label"
                label="Nome da área"
                required
                placeholder="Ex.: Sala de reunião"
            />
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancelar
                </Button>
                <Button type="submit" size="sm">
                    Criar
                </Button>
            </div>
        </form>
    );
};
