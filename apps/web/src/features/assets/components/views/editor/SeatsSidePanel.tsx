import type { ReactNode } from "react";
import { InlineError } from "@/features/assets/components/views/form/InlineError";
import { EditorSidePanel } from "./EditorSidePanel";

type Props = {
    // The list of the seats, when the page has room beside the image.
    children?: ReactNode;
    error: string | undefined;
};

// The column beside the image of the seats editor. Without a list and
// without an error there is nothing to put in it, so the image takes the
// width.
export const SeatsSidePanel = ({ children, error }: Props) => {
    if (!children && !error) return null;

    return (
        <EditorSidePanel>
            {children}
            <InlineError message={error} />
        </EditorSidePanel>
    );
};
