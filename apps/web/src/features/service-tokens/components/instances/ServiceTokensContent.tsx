import type { ServiceToken } from "@standin/contracts";
import { ServiceTokensTable } from "../views/ServiceTokensTable";
import {
    ServiceTokensEmptyState,
    ServiceTokensErrorState,
    ServiceTokensLoadingState,
} from "../views/ServiceTokensStates";

type Props = {
    serviceTokens: ServiceToken[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    // Overrides the clock that decides if a token expired (tests).
    now?: Date;
};

// The body of the page: the state that fits, or the tokens.
export const ServiceTokensContent = ({
    serviceTokens,
    isLoading,
    isError,
    onRetry,
    now,
}: Props) => {
    if (isLoading) return <ServiceTokensLoadingState />;
    if (isError) return <ServiceTokensErrorState onRetry={onRetry} />;
    if (serviceTokens.length === 0) return <ServiceTokensEmptyState />;

    return <ServiceTokensTable serviceTokens={serviceTokens} now={now} />;
};
