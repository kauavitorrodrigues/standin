import { PageContainer } from "@/components/layout/page-container";
import { SERVICE_TOKEN_PAGE_TEXT } from "../../consts/messages";
import { useServiceTokens } from "../../queries/useServiceTokens";
import { NewTokenButton } from "../instances/NewTokenButton";
import { ServiceTokensContent } from "../instances/ServiceTokensContent";

export function ServiceTokensPage() {
    const { serviceTokens, isLoading, isError, refetch } = useServiceTokens();

    return (
        <PageContainer.Root>
            <PageContainer.Header
                title={SERVICE_TOKEN_PAGE_TEXT.TITLE}
                description={SERVICE_TOKEN_PAGE_TEXT.DESCRIPTION}
                controls={<NewTokenButton />}
            />
            <PageContainer.Content className="flex flex-col gap-6 p-4">
                <ServiceTokensContent
                    serviceTokens={serviceTokens}
                    isLoading={isLoading}
                    isError={isError}
                    onRetry={() => refetch()}
                />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
