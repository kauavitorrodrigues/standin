import { SmilePlusIcon } from "lucide-react";

type Props = { icon: string };

// The chosen icon, or the sign of an empty choice.
export const IconPreview = ({ icon }: Props) => {
    if (icon === "") return <SmilePlusIcon />;

    return <span className="text-base">{icon}</span>;
};
