import { Kbd } from "@/components/ui/kbd";
import { TILE_TOOL_META } from "../../../../consts/toolMeta";

// Each tool of the editor with what it does and its key.
export const TileHelpTools = () => (
    <section className="flex flex-col gap-3 rounded-xl border p-4">
        <ul className="flex flex-col gap-3">
            {TILE_TOOL_META.map(
                ({ value, label, description, icon: Icon, shortcut }) => (
                    <li key={value} className="flex items-start gap-3">
                        <Icon className="mt-0.5 size-4 shrink-0" />
                        <div className="flex flex-1 flex-col">
                            <span className="text-sm font-medium">{label}</span>
                            <span className="text-muted-foreground text-sm">
                                {description}
                            </span>
                        </div>
                        <Kbd>{shortcut}</Kbd>
                    </li>
                )
            )}
        </ul>
    </section>
);
