import { PageContainer } from "@/components/layout/page-container";
import { AreasQueries } from "../../queries";

type Props = { areaId: string };

// Placeholder: the composer takes this page over.
export function EditAreaPage({ areaId }: Props) {
    const { area } = AreasQueries.useDetails(areaId);

    return (
        <PageContainer.Root>
            <PageContainer.Header
                title={area?.name ?? "Editar área"}
                description="Edição da área."
            />
            <PageContainer.Content>
                <p className="text-muted-foreground text-sm">
                    O compositor de áreas ainda não está disponível.
                </p>
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
