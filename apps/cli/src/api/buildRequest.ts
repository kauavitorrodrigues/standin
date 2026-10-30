import { API_USER_AGENT, JSON_CONTENT_TYPE } from "../consts/api";
import type { ApiCall, HttpRequest, RemoteTarget } from "../types";
import { buildRequestUrl } from "../utils/buildRequestUrl";

// The request for a call. The token only travels in the header.
export const buildRequest = (
    target: RemoteTarget,
    call: ApiCall
): HttpRequest => {
    const request: HttpRequest = {
        method: call.method,
        url: buildRequestUrl(target.url, call),
        headers: {
            accept: JSON_CONTENT_TYPE,
            authorization: `Bearer ${target.token}`,
            "user-agent": API_USER_AGENT,
        },
    };
    if (call.body) {
        request.headers["content-type"] = JSON_CONTENT_TYPE;
        request.body = JSON.stringify(call.body);
    }
    return request;
};
