import type { ComponentProps } from "react";

// A desk seen from the front: the top, a leg and a drawer unit. Lucide has no
// desk, so this one follows its grid and stroke (24px, 2px, round caps) and
// takes the same props, so it sizes and colors like the other icons.
export const DeskIcon = (props: ComponentProps<"svg">) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
    >
        <path d="M2 6h20" />
        <path d="M4 6v14" />
        <path d="M20 6v14" />
        <path d="M13 6v14" />
        <path d="M13 13h7" />
        <path d="M16.5 9.5h0" />
    </svg>
);
