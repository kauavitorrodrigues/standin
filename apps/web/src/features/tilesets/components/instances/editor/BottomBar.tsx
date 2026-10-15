import type { ReactNode } from "react";
import { BottomBar } from "@/components/editor/BottomBar";
import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";

type Props = { children: ReactNode };

// The actions of the editor (discard, save) on the bottom of the sheet.
export const TileEditorBottomBar = ({ children }: Props) => {
    const { propertiesOpen } = useTileEditorContext();

    return <BottomBar panelOpen={propertiesOpen}>{children}</BottomBar>;
};
