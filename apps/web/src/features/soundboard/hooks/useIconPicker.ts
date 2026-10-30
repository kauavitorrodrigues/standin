import { useState } from "react";
import { isSingleEmoji } from "@standin/contracts";

type Options = { onChange: (icon: string) => void };

/** The open state of the picker, and what choosing an icon does. */
export const useIconPicker = ({ onChange }: Options) => {
    const [open, setOpen] = useState(false);

    const pick = (icon: string) => {
        if (isSingleEmoji(icon)) onChange(icon);
        setOpen(false);
    };

    const clear = () => {
        onChange("");
        setOpen(false);
    };

    return { open, setOpen, pick, clear };
};
