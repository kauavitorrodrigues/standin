import { Separator } from "@/components/ui/separator";

type Props = {
    // Only between the fixed reactions and the recent ones.
    visible: boolean;
};

export const ReactionBarSeparator = ({ visible }: Props) => {
    if (!visible) return null;

    return (
        <Separator
            orientation="vertical"
            className="mx-1 h-5 self-center bg-border"
        />
    );
};
