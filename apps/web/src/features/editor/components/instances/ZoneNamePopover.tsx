import { useMemo } from "react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { ZoneNameForm } from "@/features/editor/components/forms/ZoneNameForm";
import { useIgnoreOpeningClick } from "@/features/editor/hooks/useIgnoreOpeningClick";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import type { ZoneNameRequest } from "@/features/editor/types/zone-name-request";

type ZoneNamePopoverProps = {
    request: ZoneNameRequest | null;
    onConfirm: (label: string) => void;
    onCancel: () => void;
};

// Opens over the area or room just drawn and asks for its name. Closing it
// any way other than confirming drops it.
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

    const kind = request?.kind ?? ZONE_KINDS.AREA;

    const isOpeningClick = useIgnoreOpeningClick(request !== null);

    const handleOpenChange = (open: boolean, details: { event?: Event }) => {
        if (open) return;
        if (isOpeningClick(details.event)) return;
        onCancel();
    };

    return (
        <Popover open={request !== null} onOpenChange={handleOpenChange}>
            <PopoverContent anchor={anchor} side="bottom" align="start">
                <ZoneNameForm
                    kind={kind}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                />
            </PopoverContent>
        </Popover>
    );
};
