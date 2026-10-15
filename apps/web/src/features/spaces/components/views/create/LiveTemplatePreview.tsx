import { TemplatesQueries } from "@/features/maps/templates/queries";
import { LivePreview } from "./LivePreview";

export const LiveTemplatePreview = ({ templateId }: { templateId: string }) => {
    const { data } = TemplatesQueries.usePreview(templateId, true);

    return <LivePreview preview={data} />;
};
