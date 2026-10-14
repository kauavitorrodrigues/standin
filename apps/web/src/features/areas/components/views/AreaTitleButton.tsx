import { useFormContext, useWatch } from "react-hook-form";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";

type Props = { onClick: () => void };

// The name of the area in the title bar of the side panel. It opens the
// properties of the area.
export const AreaTitleButton = ({ onClick }: Props) => {
    const { control } = useFormContext<AreaComposerFormValues>();
    const name = useWatch({ control, name: "name" });

    return (
        <button
            type="button"
            onClick={onClick}
            className="hover:bg-accent flex cursor-pointer min-w-0 items-center rounded-md px-1.5 py-1"
        >
            <span className="truncate">{name}</span>
        </button>
    );
};
