import { useNavigate } from "@tanstack/react-router";
import { MapEditorPage } from "@/features/maps/__shared__/components/pages/MapEditorPage";
import { TemplateEditorMenu } from "../instances/EditorMenu";
import { TemplateMutations } from "../../mutations";
import { TemplatesQueries } from "../../queries";

type TemplateMapEditorPageProps = {
    templateId: string;
};

export function TemplateMapEditorPage({
    templateId,
}: TemplateMapEditorPageProps) {
    const navigate = useNavigate();
    const { template } = TemplatesQueries.useDetails(templateId);
    const { mutateAsync: setThumbnail } = TemplateMutations.setThumbnail();

    if (!template) return null;

    return (
        <MapEditorPage
            mapId={template.mapId}
            title={template.name}
            onExit={() => navigate({ to: "/admin/maps" })}
            actions={<TemplateEditorMenu template={template} />}
            thumbnail={{
                missing: !template.thumbnailUrl,
                save: (thumbnail) => setThumbnail({ templateId, thumbnail }),
            }}
        />
    );
}
