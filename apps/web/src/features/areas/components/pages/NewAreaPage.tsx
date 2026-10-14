import { PageContainer } from "@/components/layout/page-container";

// Placeholder: the composer takes this page over.
export function NewAreaPage() {
    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Nova área"
                description="Tela em branco. O tamanho se define arrastando o quadro da área."
            />
            <PageContainer.Content>
                <p className="text-muted-foreground text-sm">
                    O compositor de áreas ainda não está disponível.
                </p>
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
