import { Panel } from "@/features/decorator/components/layout/Panel";

// The panel while the decorator asks for its lock and loads the map.
export const PanelOpening = () => (
    <Panel>
        <div
            role="status"
            className="flex flex-1 items-center justify-center p-6"
        >
            <span className="animate-pulse text-xs text-muted-foreground">
                Abrindo o decorator...
            </span>
        </div>
    </Panel>
);
