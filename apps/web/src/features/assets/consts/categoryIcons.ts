import {
    ArmchairIcon,
    CoffeeIcon,
    ImageIcon,
    LampIcon,
    LibraryIcon,
    MonitorIcon,
    TableIcon,
    TreesIcon,
    type LucideIcon,
} from "lucide-react";

// The category meta in `@standin/contracts` carries an icon key, and this is
// where the client resolves it to a component.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
    armchair: ArmchairIcon,
    table: TableIcon,
    library: LibraryIcon,
    monitor: MonitorIcon,
    coffee: CoffeeIcon,
    lamp: LampIcon,
    image: ImageIcon,
    trees: TreesIcon,
};
