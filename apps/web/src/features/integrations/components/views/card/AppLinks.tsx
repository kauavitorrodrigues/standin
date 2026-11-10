import { ExternalLinkIcon } from "lucide-react";
import type { AppLink } from "../../../types/app";

type Props = {
    links: AppLink[];
};

// Links to the documentation of an app. They open in a new tab.
export const AppLinks = ({ links }: Props) => (
    <ul className="flex flex-col gap-1.5">
        {links.map((link) => (
            <li key={link.href}>
                <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                >
                    {link.label}
                    <ExternalLinkIcon className="size-3.5" />
                </a>
            </li>
        ))}
    </ul>
);
