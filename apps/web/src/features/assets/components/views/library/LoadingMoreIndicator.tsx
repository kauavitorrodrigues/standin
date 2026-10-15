import { Loader2 } from "lucide-react";

type Props = { show: boolean };

// The spinner under the list while the next page comes.
export const LoadingMoreIndicator = ({ show }: Props) => {
    if (!show) return null;
    return (
        <Loader2 className="text-muted-foreground mx-auto size-5 animate-spin" />
    );
};
