import { useMutation } from "@tanstack/react-query";
import type { PublishResult } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import {
    PUBLISH_ERROR_KIND,
    PUBLISH_MAX_ATTEMPTS,
    PUBLISH_SESSION_HEADER,
} from "../consts/publish";
import type { PublishInput } from "../types/publish-input";
import { classifyPublishError } from "../utils/classifyPublishError";
import { getRetryDelay } from "../utils/getRetryDelay";
import { PublishError } from "../utils/PublishError";

const wait = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

// Every attempt sends the same publishId, so the server can answer a repeated
// request with the result it already stored. Only retryable failures repeat.
export const publishMap = async ({
    mapId,
    sessionId,
    publishId,
    baseVersion,
    ops,
}: PublishInput): Promise<PublishResult> => {
    for (let attempt = 1; ; attempt++) {
        try {
            const res = await api.post<PublishResult>(
                `/maps/${mapId}/publish`,
                { publishId, baseVersion, ops },
                { headers: { [PUBLISH_SESSION_HEADER]: sessionId } }
            );
            return res.data;
        } catch (error) {
            const failure = classifyPublishError(error);
            const isLast = attempt >= PUBLISH_MAX_ATTEMPTS;
            if (failure.kind !== PUBLISH_ERROR_KIND.RETRYABLE || isLast) {
                throw new PublishError(failure);
            }
            await wait(getRetryDelay(attempt));
        }
    }
};

export const usePublish = () =>
    useMutation<PublishResult, PublishError, PublishInput>({
        mutationFn: publishMap,
    });
