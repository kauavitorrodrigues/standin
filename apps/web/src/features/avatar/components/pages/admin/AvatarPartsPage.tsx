import { PageContainer } from "@/components/layout/page-container";
import { useAvatarParts } from "../../../queries/admin/useAvatarParts";
import { NewRegistrationButton } from "../../instances/admin/NewRegistrationButton";
import { PartsBrowser } from "../../instances/admin/PartsBrowser";
import {
    PartsEmptyState,
    PartsErrorState,
    PartsLoadingState,
} from "../../views/admin/PartsStates";

const AvatarPartsContent = () => {
    const { total, isLoading, isError } = useAvatarParts();

    if (isLoading) return <PartsLoadingState />;
    if (isError) return <PartsErrorState />;
    if (total === 0) return <PartsEmptyState />;

    return <PartsBrowser />;
};

export function AvatarPartsPage() {
    return (
        <PageContainer.Root className="gap-0">
            <PageContainer.Header
                title="Peças de avatar"
                description="Peças globais do editor de avatar, por slot. Cada peça tem uma ou mais cores, e cada cor é um PNG na grade do avatar."
                controls={<NewRegistrationButton />}
            />
            <PageContainer.Content className="p-0">
                <AvatarPartsContent />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
