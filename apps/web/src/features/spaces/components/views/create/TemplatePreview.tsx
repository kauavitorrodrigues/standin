import type { MapTemplate } from "@standin/contracts";
import { getThumbnailAspectStyle } from "@/features/maps/templates/utils/getThumbnailAspectStyle";
import { getPreviewWidth } from "../../../utils/getPreviewWidth";
import { LiveTemplatePreview } from "./LiveTemplatePreview";
import { TemplateThumbnail } from "./TemplateThumbnail";

type Props = { template: MapTemplate; active: boolean };

// A card of the proportion of the map, grown to the biggest size that fits the
// stage (the parent is a size container). The photo is always there. The map
// is drawn over it, and only for the chosen template, so a list of them never
// starts more than one game.
export const TemplatePreview = ({ template, active }: Props) => (
    <div
        style={{
            ...getThumbnailAspectStyle(template.width, template.height),
            width: getPreviewWidth(template.width, template.height),
        }}
        className="bg-muted/40 relative overflow-hidden rounded-2xl shadow-xl"
    >
        <TemplateThumbnail template={template} />
        <ActivePreview template={template} active={active} />
    </div>
);

const ActivePreview = ({ template, active }: Props) => {
    if (!active) return null;

    return <LiveTemplatePreview templateId={template.id} />;
};
