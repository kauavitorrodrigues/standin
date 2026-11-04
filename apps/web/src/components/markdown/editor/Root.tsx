import { useEditor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import type { ReactNode, Ref } from "react";
import type { Editor } from "@tiptap/core";
import { EditorContext } from "./Context";
import { getMarkdown, textToDoc, textToInline } from "./consts/plainText";
import { createCoreExtensions } from "./consts/coreExtensions";
import { LimitLength } from "./extensions/LimitLength";
import { SubmitOnEnter } from "./extensions/SubmitOnEnter";
import type { MessageEditorHandle, SuggestionExtensionsFactory } from "./types";

type RootProps = {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    children: ReactNode;
    placeholder?: string;
    className?: string;
    maxLength?: number;
    disabled?: boolean;
    suggestions?: SuggestionExtensionsFactory;
    ref?: Ref<MessageEditorHandle>;
};

export function Root({
    value,
    onChange,
    onSubmit,
    children,
    placeholder,
    className,
    maxLength,
    disabled,
    suggestions,
    ref,
}: RootProps) {
    // The last text the editor emitted, to tell its own echoes from a value
    // that was changed from outside (a reset after sending).
    const lastEmittedRef = useRef<string | null>(null);

    const onChangeRef = useRef(onChange);
    const onSubmitRef = useRef(onSubmit);
    const placeholderRef = useRef(placeholder);
    useEffect(() => {
        onChangeRef.current = onChange;
        onSubmitRef.current = onSubmit;
        placeholderRef.current = placeholder;
    });

    const [portalContainer, setPortalContainer] =
        useState<HTMLDivElement | null>(null);
    const portalContainerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        portalContainerRef.current = portalContainer;
    });
    const getPortalContainer = useCallback(
        () => portalContainerRef.current,
        []
    );

    const extensions = useMemo(
        () => [
            ...createCoreExtensions(),
            // eslint-disable-next-line react-hooks/refs -- read by Tiptap outside of render
            Placeholder.configure({
                placeholder: () => placeholderRef.current ?? "",
            }),
            LimitLength.configure({
                max: maxLength ?? Number.MAX_SAFE_INTEGER,
            }),
            // eslint-disable-next-line react-hooks/refs -- called by Tiptap outside of render
            SubmitOnEnter.configure({
                onSubmit: () => onSubmitRef.current(),
            }),
            // eslint-disable-next-line react-hooks/refs -- read by the lists outside of render
            ...(suggestions?.(getPortalContainer) ?? []),
        ],
        [getPortalContainer, maxLength, suggestions]
    );

    const editor = useEditor({
        extensions,
        immediatelyRender: false,
        content: textToDoc(value),
        editorProps: {
            attributes: {
                role: "textbox",
                "aria-multiline": "true",
            },
        },
        onUpdate: ({ editor: current }: { editor: Editor }) => {
            const markdown = getMarkdown(current);
            if (markdown === lastEmittedRef.current) return;
            lastEmittedRef.current = markdown;
            onChangeRef.current(markdown);
        },
    });

    useEffect(() => {
        if (!editor) return;
        editor.setEditable(!disabled);
    }, [editor, disabled]);

    useEffect(() => {
        if (!editor) return;
        if (lastEmittedRef.current === null) lastEmittedRef.current = value;
        if (value === lastEmittedRef.current) return;
        lastEmittedRef.current = value;
        editor.commands.setContent(textToDoc(value));
    }, [editor, value]);

    useImperativeHandle<MessageEditorHandle, MessageEditorHandle>(
        ref,
        () => ({
            focus: () => editor?.commands.focus(),
            insertText: (text) => {
                editor?.chain().focus().insertContent(textToInline(text)).run();
            },
        }),
        [editor]
    );

    const contextValue = useMemo(
        () => ({ editor, portalContainer }),
        [editor, portalContainer]
    );

    return (
        <EditorContext.Provider value={contextValue}>
            <div className={className}>
                {editor && children}
                <div ref={setPortalContainer} style={{ display: "contents" }} />
            </div>
        </EditorContext.Provider>
    );
}
