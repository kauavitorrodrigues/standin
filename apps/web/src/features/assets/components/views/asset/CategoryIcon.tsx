import type { LucideIcon } from "lucide-react";

type Props = {
    // The icon of the category, none when the type has no default one.
    icon: LucideIcon | undefined;
    color: string | undefined;
};

export const CategoryIcon = ({ icon: Icon, color }: Props) => {
    if (!Icon) return null;
    return <Icon className="size-4" style={{ color }} />;
};
