import { PageContainer } from "@/components/layout/page-container";
import { NewAreaDialog } from "../dialogs/NewAreaDialog";
import { AreasList } from "../instances/AreasList";

export function AreasPage() {
    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Áreas"
                description="Blocos prontos de mapa, como salas e mesas, que os editores colocam inteiros."
                controls={
                    <PageContainer.Controls>
                        <NewAreaDialog />
                    </PageContainer.Controls>
                }
            />
            <PageContainer.Content>
                <AreasList />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
