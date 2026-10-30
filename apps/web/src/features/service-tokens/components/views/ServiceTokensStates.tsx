import { AlertCircle, KeyRoundIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SERVICE_TOKEN_STATES_TEXT } from "../../consts/messages";
import { NewTokenButton } from "../instances/NewTokenButton";

const SKELETON_ROWS = [0, 1, 2, 3];

export const ServiceTokensLoadingState = () => (
    <div
        role="status"
        aria-label={SERVICE_TOKEN_STATES_TEXT.LOADING_LABEL}
        className="flex flex-col gap-px overflow-hidden rounded-lg border"
    >
        {SKELETON_ROWS.map((row) => (
            <Skeleton key={row} className="h-12 w-full rounded-none" />
        ))}
    </div>
);

type ErrorProps = { onRetry: () => void };

export const ServiceTokensErrorState = ({ onRetry }: ErrorProps) => (
    <ListResponseState
        variant="error"
        icon={AlertCircle}
        title={SERVICE_TOKEN_STATES_TEXT.ERROR_TITLE}
        message={SERVICE_TOKEN_STATES_TEXT.ERROR_MESSAGE}
    >
        <Button type="button" variant="outline" onClick={onRetry}>
            {SERVICE_TOKEN_STATES_TEXT.RETRY}
        </Button>
    </ListResponseState>
);

export const ServiceTokensEmptyState = () => (
    <ListResponseState
        variant="empty"
        icon={KeyRoundIcon}
        title={SERVICE_TOKEN_STATES_TEXT.EMPTY_TITLE}
        message={SERVICE_TOKEN_STATES_TEXT.EMPTY_MESSAGE}
    >
        <NewTokenButton />
    </ListResponseState>
);
