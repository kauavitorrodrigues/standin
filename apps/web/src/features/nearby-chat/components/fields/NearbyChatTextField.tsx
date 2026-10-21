import { useEffect, useRef } from "react";
import { Controller, type Control } from "react-hook-form";
import { MessageCircleDashedIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NEARBY_CHAT_TEXTS } from "@/features/nearby-chat/consts/nearby-chat";

type Props = {
    control: Control<{ text: string }>;
    // The field takes the focus each time the panel opens.
    isOpen: boolean;
    onFocus: () => void;
    onBlur: () => void;
};

// The field of the message, with the dashed bubble on its left. It has no
// length limit: a text that is too long is told by the header and not sent.
export const NearbyChatTextField = ({
    control,
    isOpen,
    onFocus,
    onBlur,
}: Props) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    return (
        <Controller
            control={control}
            name="text"
            render={({ field: { ref, onBlur: fieldBlur, ...field } }) => (
                <div className="relative">
                    <MessageCircleDashedIcon className="pointer-events-none absolute top-1/2 left-[11px] size-4 -translate-y-1/2 text-foreground" />
                    <Input
                        {...field}
                        ref={(element) => {
                            ref(element);
                            inputRef.current = element;
                        }}
                        onFocus={onFocus}
                        onBlur={() => {
                            fieldBlur();
                            onBlur();
                        }}
                        aria-label={NEARBY_CHAT_TEXTS.FIELD_LABEL}
                        placeholder={NEARBY_CHAT_TEXTS.PLACEHOLDER}
                        autoComplete="off"
                        className="h-[34px] rounded-[10px] border-foreground/10 bg-foreground/5 pl-[37px] text-[13px] md:text-[13px] dark:bg-foreground/5"
                    />
                </div>
            )}
        />
    );
};
