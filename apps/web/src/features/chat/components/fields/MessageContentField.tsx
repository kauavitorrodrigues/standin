import type { Ref } from "react";
import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";
import { MAX_MESSAGE_CONTENT_LENGTH } from "@standin/contracts";
import {
    MessageEditor,
    type MessageEditorHandle,
} from "@/components/markdown/editor";

type MessageContentFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = {
    control: Control<TFieldValues>;
    name: TName;
    disabled?: boolean;
    onSubmit: () => void;
    editorRef?: Ref<MessageEditorHandle>;
    placeholder?: string;
};

// Enter sends and Shift+Enter breaks the line, so the keyboard behaviour and
// the message specific limits live in the field instead of in every caller.
// Rendered bare: the send button is disabled instead of showing a validation
// message, and MessageComposerFrame owns the visible chrome around it.
export function MessageContentField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    control,
    name,
    disabled,
    onSubmit,
    editorRef,
    placeholder = "Escreva uma mensagem...",
}: MessageContentFieldProps<TFieldValues, TName>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <MessageEditor.Root
                    ref={editorRef}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onSubmit={onSubmit}
                    placeholder={placeholder}
                    maxLength={MAX_MESSAGE_CONTENT_LENGTH}
                    disabled={disabled}
                >
                    <MessageEditor.Content className="max-h-40 overflow-y-auto" />
                </MessageEditor.Root>
            )}
        />
    );
}
