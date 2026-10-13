import type { LucideIcon } from "lucide-react";

type Props = { icon: LucideIcon | undefined };

// The icon of a filter chip, when the filter has one.
export const ActiveFilterIcon = ({ icon: Icon }: Props) => {
    if (!Icon) return null;
    return <Icon className="text-muted-foreground size-3.5" />;
};
