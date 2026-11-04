import { EditorContent } from "@tiptap/react";
import { useContext } from "react";
import { cn } from "@/lib/utils";
import { EditorContext } from "./Context";

type ContentProps = {
    className?: string;
};

const CONTENT_CLASS = cn(
    "cursor-text",
    "[&_.ProseMirror]:outline-none [&_.ProseMirror]:whitespace-pre-wrap [&_.ProseMirror]:wrap-anywhere",
    "[&_.ProseMirror_p]:m-0",
    "[&_.ProseMirror_.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_.is-editor-empty:first-child]:before:h-0 [&_.ProseMirror_.is-editor-empty:first-child]:before:text-muted-foreground/60 [&_.ProseMirror_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]"
);

// The height grows with the text up to the max height of the caller.
export function Content({ className }: ContentProps) {
    const { editor } = useContext(EditorContext);
    return (
        <EditorContent
            editor={editor}
            className={cn(CONTENT_CLASS, className)}
        />
    );
}
