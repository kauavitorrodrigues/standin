import { PageContainer } from "@/components/layout/page-container";
import { CreateSpaceForm } from "@/features/spaces/components/forms/CreateForm";

export function CreateSpacePage() {
    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Criar espaço"
                description="Dê um nome ao seu espaço e escolha um mapa abaixo."
            />
            <PageContainer.Content>
                <CreateSpaceForm />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
