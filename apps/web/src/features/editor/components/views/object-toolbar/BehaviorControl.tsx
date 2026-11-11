import { GlobeIcon } from "lucide-react";
import type { EmbeddedWebsiteParams } from "@standin/contracts";
import { BehaviorForm } from "@/features/editor/components/forms/BehaviorForm";
import { PickerControl } from "@/features/editor/components/views/PickerControl";
import { OBJECT_TOOLBAR_TOOLTIP_OFFSET_PX } from "@/features/editor/consts/object-toolbar";
import { BEHAVIOR_MESSAGES as Messages } from "@/features/editor/consts/messages";

type BehaviorControlProps = {
    show: boolean;
    params: EmbeddedWebsiteParams | null;
    onSelect: (params: EmbeddedWebsiteParams | null) => void;
};

// The website of an object whose asset embeds one. Only the people who edit
// the map see it.
export const BehaviorControl = ({
    show,
    params,
    onSelect,
}: BehaviorControlProps) => {
    if (!show) return null;

    return (
        <PickerControl
            tooltipOffset={OBJECT_TOOLBAR_TOOLTIP_OFFSET_PX}
            label={Messages.LABEL}
            preview={<GlobeIcon className="size-5" />}
            contentClassName="rounded-xl p-3"
        >
            <BehaviorForm
                // A new form for each stored value, so it starts from what is saved.
                key={JSON.stringify(params)}
                params={params}
                onSubmit={onSelect}
            />
        </PickerControl>
    );
};
