import type { ZodType } from "zod/v4";
import {
    DataInvalidIssue,
    DataRequiredIssue,
    ImageFileRequiredIssue,
    JsonPartInvalidIssue,
    LIBRARY_UPLOAD_PARTS,
    LibraryValidationError,
    MAX_DATA_PART_BYTES,
} from "@standin/contracts";
import type { LibraryIssue } from "@standin/contracts";
import type { UploadedImage } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";

type Files = Record<string, Express.Multer.File[] | undefined>;

const readFile = (req: ExtendedRequest, name: string) =>
    (req.files as Files | undefined)?.[name]?.[0];

/** The `image` part, or undefined when the request has none. */
export const readImagePart = (
    req: ExtendedRequest
): UploadedImage | undefined => {
    const file = readFile(req, LIBRARY_UPLOAD_PARTS.IMAGE);
    return file
        ? { buffer: file.buffer, originalName: file.originalname }
        : undefined;
};

const parseDataPart = <T>(
    req: ExtendedRequest,
    schema: ZodType<T>
): { data: T | null; issues: LibraryIssue[] } => {
    const name = LIBRARY_UPLOAD_PARTS.DATA;
    const file = readFile(req, name);
    // A JSON part can arrive as a file part or as a plain form field.
    const text: unknown = file
        ? file.buffer.toString("utf8")
        : req.body?.[name];
    if (typeof text !== "string") {
        return { data: null, issues: [new DataRequiredIssue()] };
    }
    if (Buffer.byteLength(text) > MAX_DATA_PART_BYTES) {
        return {
            data: null,
            issues: [new DataInvalidIssue(name, "The data part is too large.")],
        };
    }

    let json: unknown;
    try {
        json = JSON.parse(text);
    } catch {
        return { data: null, issues: [new JsonPartInvalidIssue(name)] };
    }

    const parsed = schema.safeParse(json);
    if (parsed.success) return { data: parsed.data, issues: [] };
    return {
        data: null,
        issues: parsed.error.issues.map(
            ({ path, message }) =>
                new DataInvalidIssue(
                    path.map(String).join(".") || name,
                    message
                )
        ),
    };
};

/**
 * The two parts of an upload: the PNG and the validated `data`. Problems of
 * either part come together in one 422 with the whole list.
 */
export const readUploadParts = <T>(
    req: ExtendedRequest,
    schema: ZodType<T>
): { image: UploadedImage | undefined; data: T } => {
    const image = readImagePart(req);
    const { data, issues } = parseDataPart(req, schema);
    const errors = [...issues];
    if (!image) errors.push(new ImageFileRequiredIssue());

    if (data === null || errors.length > 0) {
        throw new LibraryValidationError(errors);
    }
    return { image, data };
};
