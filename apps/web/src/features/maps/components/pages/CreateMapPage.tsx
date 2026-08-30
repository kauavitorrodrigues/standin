import { PageContainer } from "@/components/layout/page-container";
import { CreateMapForm } from "@/features/maps/components/forms/CreateForm";

export function CreateMapPage() {
    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Criar mapa"
                description="Envie o JSON do tile map e as imagens dos tilesets."
            />
            <PageContainer.Content className="items-center justify-center">
                <CreateMapForm />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
