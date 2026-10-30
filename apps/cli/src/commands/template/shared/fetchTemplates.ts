import type { MapSizeTier, MapTemplate } from "@standin/contracts";
import { callApi } from "../../../api/callApi";
import { ApiResponseInvalidError } from "../../../errors/ApiResponseInvalidError";
import type {
    ApiCall,
    HttpTransport,
    RemoteTarget,
    TemplateListAnswer,
} from "../../../types";
import { TEMPLATE_PATHS } from "../consts";
import { readTemplate } from "./readTemplate";

// The templates of the instance, all of them or one size tier. An admin
// reads every status.
export const fetchTemplates = async (
    http: HttpTransport,
    target: RemoteTarget,
    sizeTier?: MapSizeTier
): Promise<MapTemplate[]> => {
    const call: ApiCall = { method: "GET", path: TEMPLATE_PATHS.list };
    if (sizeTier) call.query = { sizeTier };
    const answer: TemplateListAnswer = await callApi<TemplateListAnswer>(
        http,
        target,
        call
    );
    if (!Array.isArray(answer.templates)) throw new ApiResponseInvalidError();
    return answer.templates.map(readTemplate);
};
