import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    STAMP_MAX_HEIGHT,
    STAMP_MAX_WIDTH,
    STAMP_MIN_SIZE,
} from "@standin/contracts";
import { NumberFormField } from "@/components/fields/NumberFormField";
import { FormDialogControls } from "@/components/FormDialogControls";
import { NEW_AREA_DEFAULT_SIZE } from "../../consts/newArea";
import type { NewAreaFormValues } from "../../types/newAreaForm";
import { NewAreaSchema } from "../../utils/newAreaSchema";

type Props = {
    onShowDialog: (open: boolean) => void;
};

// The size of the blank canvas the composer opens with.
export const NewAreaForm = ({ onShowDialog }: Props) => {
    const navigate = useNavigate();
    const form = useForm<NewAreaFormValues>({
        resolver: zodResolver(NewAreaSchema),
        defaultValues: NEW_AREA_DEFAULT_SIZE,
    });

    const onSubmit = ({ width, height }: NewAreaFormValues) => {
        onShowDialog(false);
        navigate({
            to: "/admin/areas/new",
            search: { width, height },
        }).catch(() => undefined);
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
        >
            <div className="grid grid-cols-2 gap-4">
                <NumberFormField
                    control={form.control}
                    name="width"
                    label="Largura (tiles)"
                    required
                    min={STAMP_MIN_SIZE}
                    max={STAMP_MAX_WIDTH}
                />
                <NumberFormField
                    control={form.control}
                    name="height"
                    label="Altura (tiles)"
                    required
                    min={STAMP_MIN_SIZE}
                    max={STAMP_MAX_HEIGHT}
                />
            </div>
            <FormDialogControls
                onClose={() => {
                    form.reset();
                    onShowDialog(false);
                }}
                submitLabel="Criar área"
                isSubmitting={false}
            />
        </form>
    );
};
