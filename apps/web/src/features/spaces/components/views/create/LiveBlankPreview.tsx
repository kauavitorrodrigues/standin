import type { SizeTier } from "@standin/contracts";
import { TemplatesQueries } from "@/features/maps/templates/queries";
import { LivePreview } from "./LivePreview";

export const LiveBlankPreview = ({ tier }: { tier: SizeTier }) => {
    const { data } = TemplatesQueries.useBlankPreview(tier, true);

    return <LivePreview preview={data} />;
};
