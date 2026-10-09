import { Copy, type LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { useClipboardCopy } from "@/hooks/useClipboardCopy";
import { cn } from "@/lib/utils";

type ClipboardCopyButtonProps = {
    text: string;
    copyLabel?: string;
    copiedLabel?: string;
    className?: string;
    variant?: ButtonProps["variant"];
    icon?: LucideIcon;
};

export function ClipboardCopyButton({
    text,
    className,
    copiedLabel = "Copiado!",
    copyLabel = "Copiar",
    variant = "secondary",
    icon: Icon = Copy,
}: ClipboardCopyButtonProps) {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const { copied, handleCopy } = useClipboardCopy(text);

    return (
        <Tooltip open={copied || tooltipOpen} onOpenChange={setTooltipOpen}>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        variant={variant}
                        size="icon"
                        className={className}
                        onClick={handleCopy}
                    >
                        <Icon />
                    </Button>
                }
            />
            <TooltipContent>{copied ? copiedLabel : copyLabel}</TooltipContent>
        </Tooltip>
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
