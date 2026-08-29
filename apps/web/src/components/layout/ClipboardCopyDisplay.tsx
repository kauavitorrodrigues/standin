import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";

function useClipboardCopy(text: string) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return { copied, handleCopy };
}

type ClipboardCopyButtonProps = {
    text: string;
    copyLabel?: string;
    copiedLabel?: string;
    className?: string;
};

export function ClipboardCopyButton({
    text,
    className,
    copiedLabel = "Copiado!",
    copyLabel = "Copiar",
}: ClipboardCopyButtonProps) {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const { copied, handleCopy } = useClipboardCopy(text);

    return (
        <TooltipProvider>
            <Tooltip open={copied || tooltipOpen} onOpenChange={setTooltipOpen}>
                <TooltipTrigger
                    render={
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className={className}
                            onClick={handleCopy}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    }
                />
                <TooltipContent>
                    {copied ? copiedLabel : copyLabel}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

type ClipboardCopyDisplayProps = {
    text: string;
    copyLabel?: string;
    copiedLabel?: string;
    className?: string;
};

export function ClipboardCopyDisplay({
    text,
    className,
    copiedLabel = "Copiado!",
    copyLabel = "Copiar",
}: ClipboardCopyDisplayProps) {
    const { copied, handleCopy } = useClipboardCopy(text);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    return (
        <div className={cn("relative", className)}>
            <pre className="mt-2 overflow-auto rounded-lg bg-slate-100 p-4 whitespace-pre-wrap break-words">
                <span className="text-sm text-center text-slate-900">
                    {text}
                </span>
            </pre>
            <TooltipProvider>
                <Tooltip
                    open={copied || tooltipOpen}
                    onOpenChange={setTooltipOpen}
                >
                    <TooltipTrigger
                        render={
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-5 hover:bg-transparent"
                                onClick={handleCopy}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        }
                    />
                    <TooltipContent>
                        {copied ? copiedLabel : copyLabel}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
