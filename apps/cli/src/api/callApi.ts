import { FIRST_ERROR_STATUS, FIRST_REDIRECT_STATUS } from "../consts/api";
import { ApiRedirectError } from "../errors/ApiRedirectError";
import { ApiResponseInvalidError } from "../errors/ApiResponseInvalidError";
import type {
    ApiCall,
    HttpRequest,
    HttpResponse,
    HttpTransport,
    RemoteTarget,
} from "../types";
import { describeRedirect } from "../utils/describeRedirect";
import { buildRequest } from "./buildRequest";
import { isJsonObject } from "./isJsonObject";
import { sendRequest } from "./sendRequest";
import { toApiError } from "./toApiError";
import { toApiFailure } from "./toApiFailure";

// One call of the API. It gives back the body of a success and throws the
// error of the CLI for anything else. A redirect is not followed: the token
// goes only where the operator pointed it.
export const callApi = async <Body>(
    http: HttpTransport,
    target: RemoteTarget,
    call: ApiCall
): Promise<Body> => {
    const request: HttpRequest = buildRequest(target, call);
    const response: HttpResponse = await sendRequest(http, request);

    if (response.status >= FIRST_ERROR_STATUS) {
        throw toApiError(toApiFailure(response.status, response.body));
    }
    if (response.status >= FIRST_REDIRECT_STATUS) {
        throw new ApiRedirectError(
            response.status,
            describeRedirect(response.location, request.url)
        );
    }
    if (!isJsonObject(response.body)) throw new ApiResponseInvalidError();
    return response.body as Body;
};
