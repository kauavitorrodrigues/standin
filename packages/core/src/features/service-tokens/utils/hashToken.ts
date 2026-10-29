import { createHash } from "node:crypto";

// A fast hash is enough: the token is random and long, so there is nothing to
// brute force. It lets the lookup be a plain indexed equality.
export const hashToken = (token: string): string =>
    createHash("sha256").update(token).digest("hex");
