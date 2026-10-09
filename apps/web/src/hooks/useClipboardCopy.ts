import { useState } from "react";

export const useClipboardCopy = (text: string) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return { copied, handleCopy };
};
