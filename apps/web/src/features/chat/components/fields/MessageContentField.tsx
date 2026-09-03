import { useCallback, useLayoutEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import {
    Controller,
    useWatch,
    type Control,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";
import { MAX_MESSAGE_CONTENT_LENGTH } from "@standin/contracts";
import { Textarea } from "@/components/ui/textarea";

type MessageContentFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = {
    control: Control<TFieldValues>;
    name: TName;
    disabled?: boolean;
    onSubmit: () => void;
    onTextareaRef?: (element: HTMLTextAreaElement | null) => void;
};

// Enter sends and Shift+Enter breaks the line, so the keyboard behaviour and
// the message specific limits live in the field instead of in every caller.
// Rendered bare: the send button is disabled instead of showing a validation
// message, and MessageComposerFrame owns the visible chrome around it.
//
// Height is grown by JS (measuring scrollHeight) rather than the CSS
// `field-sizing: content` property, which is too recent to rely on across
// browsers. `field-sizing-fixed` turns that CSS behaviour off so it can't
// fight the manual resize.
export function MessageContentField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    control,
    name,
    disabled,
    onSubmit,
    onTextareaRef,
}: MessageContentFieldProps<TFieldValues, TName>) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const value = useWatch({ control, name });

    const resize = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, []);

    useLayoutEffect(() => {
        resize();
    }, [value, resize]);

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key !== "Enter" || event.shiftKey) return;
        event.preventDefault();
        onSubmit();
    };

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { ref, ...field } }) => (
                <Textarea
                    {...field}
                    ref={(element) => {
                        ref(element);
                        textareaRef.current = element;
                        onTextareaRef?.(element);
                    }}
                    id={name}
                    value={field.value ?? ""}
                    disabled={disabled}
                    onKeyDown={handleKeyDown}
                    placeholder="Escreva uma mensagem..."
                    maxLength={MAX_MESSAGE_CONTENT_LENGTH}
                    rows={1}
                    className="field-sizing-fixed max-h-40 min-h-0 resize-none overflow-y-auto wrap-anywhere border-0 bg-transparent p-0 shadow-none outline-none focus-visible:ring-0 disabled:bg-transparent dark:bg-transparent dark:disabled:bg-transparent"
                />
            )}
        />
    );
}
