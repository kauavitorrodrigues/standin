import { AreaNameField } from "./AreaNameField";
import { AreaZoneKindField } from "./AreaZoneKindField";

// The name of the area with the kind of its zone to the right.
export const AreaNameRow = () => (
    <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
            <AreaNameField />
        </div>
        <div className="w-40 shrink-0">
            <AreaZoneKindField />
        </div>
    </div>
);
