import { Kbd } from "@/components/ui/kbd";
import { TILE_CATEGORY_META } from "../../../../consts/categoryMeta";

// The categories with their colors and keys, and how the key reaches the tiles.
export const TileHelpCategories = () => (
    <section className="flex flex-col gap-3 rounded-xl border p-4">
        <ul className="flex flex-col gap-2">
            {TILE_CATEGORY_META.map(
                ({ value, label, color, icon: Icon, shortcut }) => (
                    <li
                        key={value}
                        className="flex items-center justify-between gap-4 text-sm"
                    >
                        <span className="flex items-center gap-2">
                            <Icon className="size-4" style={{ color }} />
                            {label}
                        </span>
                        <Kbd>{shortcut}</Kbd>
                    </li>
                )
            )}
        </ul>
        <p className="text-muted-foreground border-t pt-3 text-sm">
            Com uma ferramenta que pinta, a categoria é o pincel. Com outra, vai
            para os tiles selecionados. No numpad, escolhe o pincel de qualquer
            ferramenta, e 0 vai para a borracha.
        </p>
    </section>
);
