export type S3CompatibleConfig = {
    endpoint: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    // Address the bucket is publicly reachable at (a custom domain or the
    // provider's public `r2.dev` style URL), without the object key.
    publicUrl: string;
};
