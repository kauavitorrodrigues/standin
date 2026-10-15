import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ZoneNameField } from "@/features/editor/components/fields/ZoneNameField";
import type { ZoneKind } from "@/features/editor/types/zone-kind";
import {
    zoneNameSchema,
    type ZoneNameValues,
} from "@/features/editor/schemas/zone-name.schema";

type ZoneNameFormProps = {
    kind: ZoneKind;
    onConfirm: (label: string) => void;
    onCancel: () => void;
};

// The name of the area or room just drawn. It is required.
export const ZoneNameForm = ({
    kind,
    onConfirm,
    onCancel,
}: ZoneNameFormProps) => {
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
            <ZoneNameField control={form.control} kind={kind} />
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
