import type { MapTemplate } from "@standin/contracts";
import { TemplateCard } from "../card/Card";

type Props = { templates: MapTemplate[] };

export const TemplatesGrid = ({ templates }: Props) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
        {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
        ))}
    </div>
);
