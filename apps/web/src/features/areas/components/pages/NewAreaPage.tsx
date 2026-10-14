import { PageContainer } from "@/components/layout/page-container";
import { formatAreaSize } from "../../utils/formatAreaSize";

type Props = { width: number; height: number };

// Placeholder: the composer takes this page over.
export function NewAreaPage({ width, height }: Props) {
    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Nova área"
                description={`Tela em branco de ${formatAreaSize(width, height)} tiles.`}
            />
            <PageContainer.Content>
                <p className="text-muted-foreground text-sm">
                    O compositor de áreas ainda não está disponível.
                </p>
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
