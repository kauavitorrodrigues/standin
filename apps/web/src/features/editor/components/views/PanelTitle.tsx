import type { ReactNode } from "react";

type Props = {
    name: string;
    // The button of the name that opens the menu of the owner. Without it the
    // name is plain text.
    menu?: ReactNode;
};

// The name in the title bar of a side panel.
export const PanelTitle = ({ name, menu }: Props) => {
    if (menu) return menu;

    return <span className="px-1.5">{name}</span>;
};
