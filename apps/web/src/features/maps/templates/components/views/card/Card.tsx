import { Link } from "@tanstack/react-router";
import type { MapTemplate } from "@standin/contracts";
import { getSizeTierLabel } from "../../../utils/getSizeTierLabel";
import { getStatusLabel } from "../../../utils/getStatusLabel";
import { TemplateActions } from "../../instances/Actions";
import { TemplateDescription } from "./Description";
import { TemplateThumbnail } from "./Thumbnail";

type Props = { template: MapTemplate };

// A template of the list: the photo of the map, its name, size and status.
// The whole card opens the editor.
export const TemplateCard = ({ template }: Props) => (
    <div className="hover:bg-muted/20 relative flex flex-col gap-3 overflow-hidden rounded-lg border p-3 transition-colors">
        <Link
            to="/admin/maps/$templateId/edit"
            params={{ templateId: template.id }}
            aria-label={`Editar ${template.name}`}
            className="absolute inset-0 z-0"
        />
        <div className="absolute top-4 right-4 z-10">
            <TemplateActions template={template} />
        </div>
        <div className="pointer-events-none">
            <TemplateThumbnail template={template} />
        </div>
        <div className="pointer-events-none flex min-w-0 flex-col gap-1">
            <p className="truncate text-sm font-medium">{template.name}</p>
            <p className="text-muted-foreground truncate text-xs">
                {getSizeTierLabel(template.sizeTier)} · {template.width} x{" "}
                {template.height} tiles
            </p>
            <p className="text-muted-foreground text-xs">
                {getStatusLabel(template.status)}
            </p>
            <TemplateDescription description={template.description} />
        </div>
    </div>
);
