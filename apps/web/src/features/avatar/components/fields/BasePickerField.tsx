import { useFormContext, useWatch } from "react-hook-form";
import type { AvatarEditorFormValues } from "../../types/draft";
import type { AvatarEditorBase } from "../../types/editor";
import { resolveDraftBase } from "../../utils/draft";
import { BaseOption } from "../views/BaseOption";

type BasePickerFieldProps = { bases: readonly AvatarEditorBase[] };

// The blank avatars to start from. With a single base there is nothing to
// choose, so the picker does not show.
export const BasePickerField = ({ bases }: BasePickerFieldProps) => {
    const { control, setValue } = useFormContext<AvatarEditorFormValues>();
    const baseId = useWatch({ control, name: "baseId" });

    if (bases.length < 2) return null;

    const selected = resolveDraftBase(bases, baseId);

    return (
        <div
            role="group"
            aria-label="Corpo base"
            className="flex flex-wrap gap-2"
        >
            {bases.map((base) => (
                <BaseOption
                    key={base.id}
                    base={base}
                    isSelected={base.id === selected?.id}
                    onSelect={() =>
                        setValue("baseId", base.id, { shouldDirty: true })
                    }
                />
            ))}
        </div>
    );
};
