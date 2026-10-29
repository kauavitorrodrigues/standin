import { randomBytes } from "node:crypto";
import { SERVICE_TOKEN_PREFIX } from "@standin/contracts";
import { TOKEN_RANDOM_BYTES } from "../consts";

// 256 bits from the system generator. base64url keeps it safe in a header.
export const generateToken = (): string =>
    `${SERVICE_TOKEN_PREFIX}${randomBytes(TOKEN_RANDOM_BYTES).toString("base64url")}`;
