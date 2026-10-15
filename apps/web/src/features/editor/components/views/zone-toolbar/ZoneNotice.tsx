import { ToolbarSection } from "@/features/editor/components/layout/ToolbarSection";

type ZoneNoticeProps = {
    notice: string | null;
};

// Why a change to the zone was refused (for example, removing the last
// spawn), beside the controls.
export const ZoneNotice = ({ notice }: ZoneNoticeProps) => {
    if (notice === null) return null;

    return (
        <ToolbarSection>
            <span role="alert" className="px-2 text-xs text-destructive">
                {notice}
            </span>
        </ToolbarSection>
    );
};
