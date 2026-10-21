import { getNearbyFooterText } from "@/features/nearby-chat/utils/getNearbyFooterText";

type Props = { hasText: boolean };

export const NearbyChatFooter = ({ hasText }: Props) => (
    <p className="px-1.5 pt-1.5 pb-0.5 text-[11px] text-muted-foreground">
        {getNearbyFooterText(hasText)}
    </p>
);
