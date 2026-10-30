import type { HttpRequest, HttpResponse, HttpTransport } from "../types";
import { toNetworkError } from "./toNetworkError";

// Sends the request; a transport that fails is the network error of the CLI.
export const sendRequest = async (
    http: HttpTransport,
    request: HttpRequest
): Promise<HttpResponse> => {
    try {
        return await http(request);
    } catch (error) {
        throw toNetworkError(error);
    }
};
