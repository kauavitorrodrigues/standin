import type { MapTemplate, SizeTier } from "@standin/contracts";
import { getNearbyTemplates } from "../../../utils/getNearbyTemplates";
import { BlankPreview } from "./BlankPreview";
import { PreviewLayer } from "./PreviewLayer";
import { PreviewSkeleton } from "./PreviewSkeleton";
import { TemplatePreview } from "./TemplatePreview";

type Props = {
    templates: MapTemplate[];
    templateId: string | undefined;
    sizeTier: SizeTier;
    isLoading: boolean;
};

// The right half of the page: the map the space is going to start from, to
// see at a glance how it will look. The size container is the stage the
// previews are fitted into.
export const SpacePreview = ({
    templates,
    templateId,
    sizeTier,
    isLoading,
}: Props) => {
    if (isLoading) return <PreviewSkeleton />;

    const nearby = getNearbyTemplates(templates, templateId, sizeTier);

    return (
        <div style={{ containerType: "size" }} className="relative size-full">
            {nearby.map((template) => (
                <PreviewLayer
                    key={template.id}
                    active={template.id === templateId}
                >
                    <TemplatePreview
                        template={template}
                        active={template.id === templateId}
                    />
                </PreviewLayer>
            ))}
            <PreviewLayer active={!templateId}>
                <BlankPreview tier={sizeTier} active={!templateId} />
            </PreviewLayer>
        </div>
    );
};
