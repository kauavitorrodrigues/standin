import { UsageMeter } from "@/features/editor/components/views/panel/UsageMeter";
import { useUsage } from "@/features/editor/hooks/useUsage";

// The foot of the side panel: the meter of objects, counted on the draft.
export const UsageFooter = () => {
    const usage = useUsage();

    return (
        <div
            className="flex min-h-12 shrink-0 items-center border-t px-3 py-2"
            aria-label="Uso do mapa"
        >
            <UsageMeter {...usage} />
        </div>
    );
};
