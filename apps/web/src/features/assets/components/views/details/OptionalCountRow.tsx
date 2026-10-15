import type { LucideIcon } from "lucide-react";
import { DetailsRow } from "./DetailsRow";

type Props = {
    icon: LucideIcon;
    label: string;
    count: number;
};

// A count of the family that only matters when there is any, like its colors.
export const OptionalCountRow = ({ icon, label, count }: Props) => {
    if (count === 0) return null;

    return (
        <DetailsRow icon={icon} label={label}>
            {count}
        </DetailsRow>
    );
};
