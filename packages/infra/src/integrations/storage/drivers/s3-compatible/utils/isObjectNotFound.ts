// Not every S3-compatible service names a missing key the same way, and AWS
// can answer 404 without a body when the HEAD-style lookup fails.
export const isObjectNotFound = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false;

    const status = (error as { $metadata?: { httpStatusCode?: number } })
        .$metadata?.httpStatusCode;

    return (
        error.name === "NoSuchKey" ||
        error.name === "NotFound" ||
        status === 404
    );
};
