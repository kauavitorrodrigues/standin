import { PageContainer } from "@/components/layout/page-container";
import { AreasList } from "../instances/AreasList";
import { NewAreaButton } from "../instances/NewAreaButton";

export function AreasPage() {
    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Áreas"
                description="Blocos prontos de mapa, como salas e mesas, que os editores colocam inteiros."
                controls={
                    <PageContainer.Controls>
                        <NewAreaButton />
                    </PageContainer.Controls>
                }
            />
            <PageContainer.Content>
                <AreasList />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
