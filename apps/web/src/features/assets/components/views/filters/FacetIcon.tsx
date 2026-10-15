import type { LucideIcon } from "lucide-react";

type Props = { icon: LucideIcon | undefined };

// The icon of an option of the sidebar, when it has one.
export const FacetIcon = ({ icon: Icon }: Props) => {
    if (!Icon) return null;
    return <Icon className="size-4 shrink-0" />;
};
