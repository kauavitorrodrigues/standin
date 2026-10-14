import { PageContainer } from "@/components/layout/page-container";
import { CreateTemplateDialog } from "../dialogs/CreateDialog";
import { TemplatesList } from "../instances/TemplatesList";

export function TemplatesPage() {
    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Mapas"
                description="Crie os mapas usando os tilesets e a biblioteca de recursos."
                controls={
                    <PageContainer.Controls>
                        <CreateTemplateDialog />
                    </PageContainer.Controls>
                }
            />
            <PageContainer.Content>
                <TemplatesList />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
