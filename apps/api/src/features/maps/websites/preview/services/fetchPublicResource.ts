import { request } from "node:https";
import { isIP } from "node:net";
import {
    BaseError,
    WebsitePreviewBlockedAddressError,
    WebsitePreviewRequestError,
    WebsitePreviewTimeoutError,
    WebsitePreviewTooLargeError,
    WebsitePreviewTooManyRedirectsError,
    WebsitePreviewUnsupportedContentError,
} from "@standin/contracts";
import { PREVIEW_USER_AGENT, WEBSITE_PREVIEW_LIMITS } from "../consts";
import type { FetchOptions, FetchResource, FetchStep } from "../types";
import { createGuardedLookup } from "../utils/createGuardedLookup";
import { isPublicAddress } from "../utils/isPublicAddress";

const guardedLookup = createGuardedLookup();

const toPreviewError = (error: unknown, signal: AbortSignal): BaseError => {
    if (error instanceof BaseError) return error;
    if (signal.aborted) return new WebsitePreviewTimeoutError();
    return new WebsitePreviewRequestError();
};

// A header sent more than once arrives as a list; it is read as one value.
const readHeader = (value: string | string[] | undefined): string | null => {
    if (value === undefined) return null;
    return Array.isArray(value) ? value.join(", ") : value;
};

const normalizeType = (header: string | undefined): string =>
    (header ?? "").split(";")[0]!.trim().toLowerCase();

// Where the server may connect: https, the default port, no login in the
// address, and an IP written out must itself be a public one. A name is
// checked later, on the addresses it resolves to.
const parseTarget = (value: string): URL => {
    if (!URL.canParse(value)) throw new WebsitePreviewRequestError();

    const target = new URL(value);
    const isDefaultPort =
        target.port === "" ||
        target.port === String(WEBSITE_PREVIEW_LIMITS.PORT);
    if (target.protocol !== "https:" || !isDefaultPort) {
        throw new WebsitePreviewRequestError();
    }
    if (target.username || target.password) {
        throw new WebsitePreviewRequestError();
    }

    const host = target.hostname.replace(/^\[|\]$/g, "");
    if (isIP(host) !== 0 && !isPublicAddress(host)) {
        throw new WebsitePreviewBlockedAddressError();
    }
    return target;
};

const readOnce = (
    target: URL,
    options: FetchOptions,
    signal: AbortSignal
): Promise<FetchStep> =>
    new Promise((resolve, reject) => {
        const fail = (error: unknown) => reject(toPreviewError(error, signal));

        const outgoing = request(
            {
                hostname: target.hostname.replace(/^\[|\]$/g, ""),
                port: WEBSITE_PREVIEW_LIMITS.PORT,
                path: `${target.pathname}${target.search}`,
                method: "GET",
                // A new connection each time, and no compression, which keeps
                // a small answer from inflating into a large one.
                agent: false,
                headers: {
                    accept: options.acceptedTypes.join(", "),
                    "accept-encoding": "identity",
                    "user-agent": PREVIEW_USER_AGENT,
                },
                lookup: guardedLookup,
                signal,
            },
            (response) => {
                const status = response.statusCode ?? 0;
                const location = response.headers.location;
                if (status >= 300 && status < 400 && location) {
                    response.resume();
                    return resolve({ kind: "redirect", location });
                }
                if (status !== 200) {
                    response.destroy();
                    return fail(new WebsitePreviewRequestError());
                }

                const contentType = normalizeType(
                    response.headers["content-type"]
                );
                if (!options.acceptedTypes.includes(contentType)) {
                    response.destroy();
                    return fail(new WebsitePreviewUnsupportedContentError());
                }

                const declared = Number(response.headers["content-length"]);
                if (
                    options.overflow === "reject" &&
                    declared > options.maxBytes
                ) {
                    response.destroy();
                    return fail(new WebsitePreviewTooLargeError());
                }

                const chunks: Buffer[] = [];
                let size = 0;
                const finish = () =>
                    resolve({
                        kind: "resource",
                        resource: {
                            contentType,
                            body: Buffer.concat(chunks),
                            frameHeaders: {
                                xFrameOptions: readHeader(
                                    response.headers["x-frame-options"]
                                ),
                                contentSecurityPolicy: readHeader(
                                    response.headers["content-security-policy"]
                                ),
                            },
                        },
                    });

                response.on("data", (chunk: Buffer) => {
                    size += chunk.length;
                    if (size <= options.maxBytes) {
                        chunks.push(chunk);
                        return;
                    }
                    if (options.overflow === "reject") {
                        response.destroy();
                        return fail(new WebsitePreviewTooLargeError());
                    }

                    chunks.push(
                        chunk.subarray(
                            0,
                            chunk.length - (size - options.maxBytes)
                        )
                    );
                    response.destroy();
                    finish();
                });
                response.on("end", finish);
                response.on("error", fail);
                // A connection that closes before the end, with nothing else
                // settled, is a failed read. Settling twice does nothing.
                response.on("close", () =>
                    fail(new WebsitePreviewRequestError())
                );
            }
        );

        outgoing.on("error", fail);
        outgoing.end();
    });

/**
 * Reads one address on the public internet and nothing else: https on the
 * default port, a name that resolves only to public addresses, at most a few
 * redirects (each one checked like the first), a total time limit, and a size
 * limit on what is read. Every refusal is an error of its own kind.
 */
export const fetchPublicResource: FetchResource = async (url, options) => {
    const signal = AbortSignal.timeout(WEBSITE_PREVIEW_LIMITS.TIMEOUT_MS);
    let current = url;

    for (let hop = 0; hop <= WEBSITE_PREVIEW_LIMITS.MAX_REDIRECTS; hop += 1) {
        const target = parseTarget(current);
        const step = await readOnce(target, options, signal);
        if (step.kind === "resource") {
            return { ...step.resource, finalUrl: target.href };
        }

        if (!URL.canParse(step.location, target)) {
            throw new WebsitePreviewRequestError();
        }
        current = new URL(step.location, target).href;
    }
    throw new WebsitePreviewTooManyRedirectsError();
};
