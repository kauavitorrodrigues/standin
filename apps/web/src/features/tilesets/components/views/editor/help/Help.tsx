import { HelpDialog } from "@/components/editor/HelpDialog";
import { TileHelpCategories } from "./Categories";
import { TileHelpShortcuts } from "./Shortcuts";
import { TileHelpTools } from "./Tools";

// How the tile editor works: the tools, the categories, and the keys and the
// mouse. The "?" that opens it sits at the end of the tools.
export const TileToolHelp = () => (
    <HelpDialog
        title="Como usar o editor"
        tabs={[
            {
                value: "tools",
                label: "Ferramentas",
                content: <TileHelpTools />,
            },
            {
                value: "categories",
                label: "Categorias",
                content: <TileHelpCategories />,
            },
            {
                value: "shortcuts",
                label: "Teclado e mouse",
                content: <TileHelpShortcuts />,
            },
        ]}
    />
);
