import { Controller, useFormContext } from "react-hook-form";
import { AREA_NAME_MAX } from "@standin/contracts";
import { Input } from "@/components/ui/input";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";

// The name of the area, in the place of the title of the side panel.
export const AreaNameField = () => {
    const { control } = useFormContext<AreaComposerFormValues>();

    return (
        <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
                <Input
                    {...field}
                    aria-label="Nome da área"
                    aria-invalid={fieldState.invalid}
                    placeholder="Nome da área"
                    maxLength={AREA_NAME_MAX}
                    className="h-8 min-w-0 text-sm font-semibold"
                />
            )}
        />
    );
};
