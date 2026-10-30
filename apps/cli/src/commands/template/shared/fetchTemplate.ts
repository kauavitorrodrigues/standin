import type { MapTemplate } from "@standin/contracts";
import { callApi } from "../../../api/callApi";
import type {
    HttpTransport,
    RemoteTarget,
    TemplateAnswer,
} from "../../../types";
import { TEMPLATE_PATHS } from "../consts";
import { readTemplate } from "./readTemplate";

// One template by its id.
export const fetchTemplate = async (
    http: HttpTransport,
    target: RemoteTarget,
    id: string
): Promise<MapTemplate> => {
    const answer: TemplateAnswer = await callApi<TemplateAnswer>(http, target, {
        method: "GET",
        path: TEMPLATE_PATHS.one(id),
    });
    return readTemplate(answer.template);
};
