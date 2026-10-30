import type { MapTemplate } from "@standin/contracts";
import { callApi } from "../../../api/callApi";
import type {
    HttpTransport,
    RemoteTarget,
    TemplateAnswer,
} from "../../../types";
import { WRITE_TIMEOUT_MS } from "../../../consts/api";
import { TEMPLATE_PATHS } from "../consts";
import { readTemplate } from "./readTemplate";

// POST /templates/:id/publish. The server refuses a template that is not a
// draft, has no thumbnail, or uses assets that are not global.
export const publishTemplateOnServer = async (
    http: HttpTransport,
    target: RemoteTarget,
    templateId: string
): Promise<MapTemplate> => {
    const answer: TemplateAnswer = await callApi<TemplateAnswer>(http, target, {
        method: "POST",
        path: TEMPLATE_PATHS.publish(templateId),
    });
    return readTemplate(answer.template);
};
