import { AvatarPartCursorInvalidError } from "@standin/contracts";

export type PartsCursor = { name: string; id: string };

/** The opaque text the client sends back to get the next page. */
export const encodePartsCursor = ({ name, id }: PartsCursor): string =>
    Buffer.from(JSON.stringify([name, id]), "utf8").toString("base64url");

/** Reads a cursor back, or `AvatarPartCursorInvalidError` (400). */
export const decodePartsCursor = (cursor: string): PartsCursor => {
    try {
        const decoded: unknown = JSON.parse(
            Buffer.from(cursor, "base64url").toString("utf8")
        );
        if (
            Array.isArray(decoded) &&
            decoded.length === 2 &&
            typeof decoded[0] === "string" &&
            typeof decoded[1] === "string"
        ) {
            return { name: decoded[0], id: decoded[1] };
        }
    } catch {
        // Falls through to the error below.
    }
    throw new AvatarPartCursorInvalidError();
};
