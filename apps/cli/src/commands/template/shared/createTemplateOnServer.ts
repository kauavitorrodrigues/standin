import type { MapTemplate } from "@standin/contracts";
import { callApi } from "../../../api/callApi";
import { WRITE_TIMEOUT_MS } from "../../../consts/api";
import type {
    HttpTransport,
    RemoteTarget,
    TemplateCreatedAnswer,
    TemplateInput,
} from "../../../types";
import { TEMPLATE_PATHS } from "../consts";
import { buildCreateBody } from "./buildCreateBody";
import { readTemplate } from "./readTemplate";

// POST /templates. The ids come from the template itself.
export const createTemplateOnServer = async (
    http: HttpTransport,
    target: RemoteTarget,
    input: TemplateInput
): Promise<TemplateCreatedAnswer> => {
    const answer: TemplateCreatedAnswer = await callApi<TemplateCreatedAnswer>(
        http,
        target,
        {
            method: "POST",
            path: TEMPLATE_PATHS.list,
            body: buildCreateBody(input),
            timeoutMs: WRITE_TIMEOUT_MS,
        }
    );
    const template: MapTemplate = readTemplate(answer.template);
    return { template, templateId: template.id, mapId: template.mapId };
};
