import { PageContainer } from "@/components/layout/page-container";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { SpacesQueries } from "@/features/spaces/queries";

export function SpaceDetailsPage({ spaceId }: { spaceId: string }) {
    const organizationId = useOrganization().organization?.id ?? "";
    const { space, isLoading, isError } = SpacesQueries.useDetails(
        organizationId,
        spaceId,
    );

    return (
        <PageContainer.Root>
            <PageContainer.Header title="Detalhes do espaço" />
            <PageContainer.Content>
                {isLoading && <p>Carregando...</p>}
                {isError && <p>Erro ao buscar os detalhes do espaço.</p>}
                {space && (
                    <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm">
                        {JSON.stringify(space, null, 2)}
                    </pre>
                )}
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
