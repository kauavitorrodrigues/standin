import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const LogoGlyph = forwardRef<
    SVGSVGElement,
    React.SVGProps<SVGSVGElement>
>((props, ref) => (
    <svg
        ref={ref}
        role="img"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("size-10", props.className)}
        {...props}
    >
        <title>Stand!N</title>
        <rect width="100" height="100" rx="22" fill="#3652F5" />
        {/* The "!" is drawn on the 512 grid of public/brand/logo.svg */}
        <g transform="scale(0.1953125)" fill="#FFFFFF">
            <path d="M206 118a24 24 0 0 1 24-24h52a24 24 0 0 1 24 24c0 38-6 94-16 140-3 14-12 22-34 22s-31-8-34-22c-10-46-16-102-16-140z" />
            <rect x="214" y="318" width="84" height="84" rx="38" />
        </g>
    </svg>
));

LogoGlyph.displayName = "LogoGlyph";
