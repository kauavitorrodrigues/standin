import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { TextFormField } from "@/components/fields/TextFormField";
import {
    zoneNameSchema,
    type ZoneNameValues,
} from "@/features/editor/schemas/zone-name.schema";

type ZoneRenameFormProps = {
    label: string;
    onRename: (label: string) => void;
};

// The name of the selected area, in the bar over it. It is required, and
// Enter or the button confirm. A new name is ONE gesture.
export const ZoneRenameForm = ({ label, onRename }: ZoneRenameFormProps) => {
    const form = useForm<ZoneNameValues>({
        resolver: zodResolver(zoneNameSchema),
        defaultValues: { label },
    });

    const onSubmit = (values: ZoneNameValues) => onRename(values.label);

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-start gap-1"
        >
            <TextFormField
                control={form.control}
                name="label"
                placeholder="Nome da área"
                maxLength={60}
                className="w-44"
            />
            <Button type="submit" size="sm" variant="ghost">
                Renomear
            </Button>
        </form>
    );
};
