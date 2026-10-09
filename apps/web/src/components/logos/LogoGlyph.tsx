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
        <path
            transform="translate(24.98 79) scale(0.0904836 -0.0904836)"
            fill="#FAF6EE"
            d="M252 107Q306 107 329.5 126.5Q353 146 353 173Q353 198 334.5 213.5Q316 229 280 240L227 257Q173 275 131.5 297.0Q90 319 67.5 354.0Q45 389 45 443Q45 526 108.0 575.0Q171 624 283 624Q340 624 384.5 613.0Q429 602 454.5 580.5Q480 559 480 528Q480 505 469.5 488.5Q459 472 443 460Q420 476 382.0 487.5Q344 499 298 499Q250 499 226.0 483.5Q202 468 202 443Q202 423 218.0 410.5Q234 398 266 388L321 371Q412 343 461.0 296.5Q510 250 510 172Q510 88 445.0 35.5Q380 -17 257 -17Q196 -17 148.0 -4.0Q100 9 71.5 34.0Q43 59 43 92Q43 118 58.5 136.5Q74 155 93 164Q120 142 160.5 124.5Q201 107 252 107Z"
        />
    </svg>
));

LogoGlyph.displayName = "LogoGlyph";
