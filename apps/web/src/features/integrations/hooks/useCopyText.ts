import { useState } from "react";
import { COPIED_FEEDBACK_MS } from "../consts/ui";

/** Copies a text and tells for a moment that it was copied. */
export const useCopyText = (text: string) => {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
            })
            .catch(() => setCopied(false));
    };

    return { copied, copy };
};
