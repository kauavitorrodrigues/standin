import { LayersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { LayerVisibilityList } from "@/features/maps/__shared__/components/instances/LayerVisibilityList";

// The layers behind a button, so they take no room in the panel. It sits
// beside the search of the tiles tab.
export const LayersPopover = () => (
    <Popover>
        <PopoverTrigger
            render={
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    icon={LayersIcon}
                    aria-label="Camadas"
                    title="Camadas"
                />
            }
        />
        <PopoverContent align="end" className="w-56 p-2">
            <LayerVisibilityList />
        </PopoverContent>
    </Popover>
);
