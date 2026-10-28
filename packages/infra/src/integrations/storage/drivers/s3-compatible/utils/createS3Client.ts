import { S3Client } from "@aws-sdk/client-s3";
import { S3_FORCE_PATH_STYLE } from "../../../consts/storage";
import type { S3CompatibleConfig } from "../types";

export const createS3Client = ({
    region,
    endpoint,
    accessKeyId,
    secretAccessKey,
}: S3CompatibleConfig): S3Client =>
    new S3Client({
        region,
        endpoint,
        forcePathStyle: S3_FORCE_PATH_STYLE,
        // The SDK adds checksum headers by default, which older MinIO and some
        // other S3-compatible services reject. Only send them when required.
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
        credentials: { accessKeyId, secretAccessKey },
    });
