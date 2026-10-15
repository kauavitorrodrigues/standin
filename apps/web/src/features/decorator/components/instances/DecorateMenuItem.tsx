import { SproutIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DECORATE_AVAILABILITY } from "@/features/decorator/consts/decorate-availability";
import type { DecorateAvailability } from "@/features/decorator/types/decorate-availability";

type DecorateMenuItemProps = {
    availability: DecorateAvailability;
    // Opens the decorator with no focus: the entry of someone with no desk.
    onDecorate: () => void;
};

// The Decorar item of the space menu. It is off, with the reason, while
// someone else decorates or the owner edits the space.
export const DecorateMenuItem = ({
    availability,
    onDecorate,
}: DecorateMenuItemProps) => {
    switch (availability.kind) {
        case DECORATE_AVAILABILITY.HIDDEN:
            return null;
        case DECORATE_AVAILABILITY.BLOCKED:
            return (
                <DropdownMenuItem disabled>
                    <SproutIcon />
                    {availability.reason}
                </DropdownMenuItem>
            );
        case DECORATE_AVAILABILITY.ENABLED:
            return (
                <DropdownMenuItem onClick={onDecorate}>
                    <SproutIcon />
                    Decorar
                </DropdownMenuItem>
            );
    }
};
