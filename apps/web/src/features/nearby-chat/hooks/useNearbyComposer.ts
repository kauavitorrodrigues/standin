import { useEffect, useRef, useState, type BaseSyntheticEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAsRef } from "@/hooks/useAsRef";
import { isValidNearbyText } from "@/features/game/utils/isValidNearbyText";
import { NearbyTypingNotifier } from "@/features/nearby-chat/lib/NearbyTypingNotifier";
import { getNearbyCounter } from "@/features/nearby-chat/utils/getNearbyCounter";

type Options = {
    isOpen: boolean;
    onSend: (text: string) => void;
    onTyping: (isTyping: boolean) => void;
};

type NearbyChatFormValues = { text: string };

// The field of the panel: the counter of the header, the shake of a text that is
// too long, the dots that tell the others the person is typing, and the send,
// which empties the field and leaves everything else as it is (the panel stays
// open and the focus stays in the field).
export const useNearbyComposer = ({ isOpen, onSend, onTyping }: Options) => {
    const form = useForm<NearbyChatFormValues>({
        defaultValues: { text: "" },
    });
    const text = useWatch({ control: form.control, name: "text" });
    const counter = getNearbyCounter(text);
    // Goes up every time a text that is too long is sent, and the header shakes.
    const [shakeCount, setShakeCount] = useState(0);

    const onTypingRef = useAsRef(onTyping);
    // Made in an effect, since it reads the latest callback and a ref is not
    // read while rendering. The effects below run after it, in order.
    const notifierRef = useRef<NearbyTypingNotifier | null>(null);
    useEffect(() => {
        const notifier = new NearbyTypingNotifier((value) =>
            onTypingRef.current(value)
        );
        notifierRef.current = notifier;

        return () => {
            notifier.stop();
            notifierRef.current = null;
        };
    }, [onTypingRef]);

    useEffect(() => {
        if (text.trim() === "") notifierRef.current?.stop();
        else notifierRef.current?.typing();
    }, [text]);

    // Closing the panel ends the dots.
    useEffect(() => {
        if (!isOpen) notifierRef.current?.stop();
    }, [isOpen]);

    const submit = (event?: BaseSyntheticEvent) =>
        form.handleSubmit(({ text: value }) => {
            const message = value.trim();
            if (message === "") return;
            if (!isValidNearbyText(message)) {
                setShakeCount((count) => count + 1);
                return;
            }

            onSend(message);
            notifierRef.current?.stop();
            form.reset({ text: "" });
        })(event);

    return {
        control: form.control,
        counter,
        shakeCount,
        hasText: text.trim() !== "",
        submit,
        stopTyping: () => notifierRef.current?.stop(),
        startTyping: () => {
            if (text.trim() !== "") notifierRef.current?.typing();
        },
    };
};
