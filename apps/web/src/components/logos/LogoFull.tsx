import { cn } from "@/lib/utils";
import { LogoGlyph } from "./LogoGlyph";
import { LogoWordmark } from "./LogoWordmark";

// The glyph and the wordmark side by side.
export const LogoFull = ({ className }: { className?: string }) => (
    <span className={cn("flex items-center gap-2.5 text-primary", className)}>
        <LogoGlyph className="size-6" />
        <LogoWordmark className="h-4" />
    </span>
);
