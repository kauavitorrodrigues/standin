import { useMemo } from "react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { ZoneNameForm } from "@/features/maps/__shared__/components/forms/ZoneNameForm";
import type { ZoneNameRequest } from "@/features/maps/__shared__/types/zone-name-request";

type ZoneNamePopoverProps = {
    request: ZoneNameRequest | null;
    onConfirm: (label: string) => void;
    onCancel: () => void;
};

// Opens over the area just drawn and asks for its name. Closing it any way
// other than confirming drops the area.
export const ZoneNamePopover = ({
    request,
    onConfirm,
    onCancel,
}: ZoneNamePopoverProps) => {
    const anchor = useMemo(() => {
        if (!request) return undefined;
        const { left, top, width, height } = request.anchor;
        return {
            getBoundingClientRect: () =>
                DOMRect.fromRect({ x: left, y: top, width, height }),
        };
    }, [request]);

    const handleOpenChange = (open: boolean) => {
        if (!open) onCancel();
    };

    return (
        <Popover open={request !== null} onOpenChange={handleOpenChange}>
            <PopoverContent anchor={anchor} side="bottom" align="start">
                <ZoneNameForm onConfirm={onConfirm} onCancel={onCancel} />
            </PopoverContent>
        </Popover>
    );
};
