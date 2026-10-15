import { Panel } from "@/features/decorator/components/layout/Panel";
import { PanelHeader } from "@/features/decorator/components/views/PanelHeader";

type PanelNoticeProps = {
    title: string;
    message: string;
    onClose: () => void;
};

// The panel with a message in place of the library: the decorator did not
// open, or it cannot go on. The X closes it.
export const PanelNotice = ({ title, message, onClose }: PanelNoticeProps) => (
    <Panel>
        <PanelHeader onClose={onClose} />
        <div
            role="status"
            className="flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center"
        >
            <span className="text-sm font-medium">{title}</span>
            <span className="text-xs text-muted-foreground">{message}</span>
        </div>
    </Panel>
);
