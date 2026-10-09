import { LayoutGridIcon, MapIcon } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { STAGE_VIEWS, type StageView } from "@/features/spaces/consts/stage";

type StageViewToggleProps = {
    view: StageView;
    onViewChange: (view: StageView) => void;
};

// Switches between the office and the full view of everyone nearby.
export const StageViewToggle = ({
    view,
    onViewChange,
}: StageViewToggleProps) => (
    <ToggleGroup
        value={[view]}
        // Pressing the selected item would unselect it: a view is always
        // chosen, so that empty value is ignored.
        onValueChange={([next]) => {
            if (next) onViewChange(next as StageView);
        }}
        aria-label="Modo de visualização"
        className="pointer-events-auto rounded-lg bg-background/40 p-0.5 ring-1 ring-foreground/10 backdrop-blur-md"
    >
        <Tooltip>
            <TooltipTrigger
                render={
                    <ToggleGroupItem
                        value={STAGE_VIEWS.OFFICE}
                        aria-label="Escritório"
                        className="size-7 rounded-md hover:bg-foreground/10 [&_svg:not([class*='size-'])]:size-4"
                    />
                }
            >
                <MapIcon />
            </TooltipTrigger>
            <TooltipContent>Escritório</TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger
                render={
                    <ToggleGroupItem
                        value={STAGE_VIEWS.GRID}
                        aria-label="Todos os participantes"
                        className="size-7 rounded-md hover:bg-foreground/10 [&_svg:not([class*='size-'])]:size-4"
                    />
                }
            >
                <LayoutGridIcon />
            </TooltipTrigger>
            <TooltipContent>Todos os participantes</TooltipContent>
        </Tooltip>
    </ToggleGroup>
);
