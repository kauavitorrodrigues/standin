import { PageContainer } from "@/components/layout/page-container";
import { useAvatarBases } from "../../../queries/admin/useAvatarBases";
import { BasesBrowser } from "../../instances/admin/BasesBrowser";
import { NewRegistrationButton } from "../../instances/admin/NewRegistrationButton";
import {
    BasesEmptyState,
    BasesErrorState,
    BasesLoadingState,
} from "../../views/admin/BasesStates";

const AvatarBasesContent = () => {
    const { groups, isLoading, isError } = useAvatarBases();

    if (isLoading) return <BasesLoadingState />;
    if (isError) return <BasesErrorState />;
    if (groups.every((group) => group.bases.length === 0)) {
        return <BasesEmptyState />;
    }

    return <BasesBrowser />;
};

export function AvatarBasesPage() {
    return (
        <PageContainer.Root className="gap-0">
            <PageContainer.Header
                title="Bases de avatar"
                description="O corpo em branco das pessoas e o manequim que recebe as peças na prévia do admin."
                controls={<NewRegistrationButton />}
            />
            <PageContainer.Content className="p-0">
                <AvatarBasesContent />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
