import { PageContainer } from "@/components/layout/page-container";
import { Browser } from "@/features/assets/components/instances/browser/Browser";
import { CreateButton } from "@/features/assets/components/instances/browser/CreateButton";
import {
    AssetsEmptyState,
    AssetsErrorState,
    AssetsLoadingState,
} from "@/features/assets/components/views/library/ContentStates";
import { useLibraryOverview } from "@/features/assets/queries/useLibraryOverview";

const AssetsContent = () => {
    const { groups, isLoading, isError } = useLibraryOverview();

    if (isLoading) return <AssetsLoadingState />;
    if (isError) return <AssetsErrorState />;
    if (groups.length === 0) return <AssetsEmptyState />;

    return <Browser />;
};

export function AssetsPage() {
    return (
        <PageContainer.Root className="gap-0">
            <PageContainer.Header
                title="Biblioteca de recursos"
                description="Peças globais, disponíveis para todas as organizações."
                controls={<CreateButton />}
            />
            <PageContainer.Content className="p-0">
                <AssetsContent />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
