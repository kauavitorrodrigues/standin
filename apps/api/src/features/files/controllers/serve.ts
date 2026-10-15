import type { Request, Response } from "express";
import { resolveFileDelivery } from "@standin/infra";
import { FileService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";

// The name of a stored file is a uuid that never changes, so the answer can be
// cached for as long as a browser keeps it.
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

export const serveFile = async (req: Request, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("id"), req.params, res);
        if (!params) return;

        const file = await FileService.findById(params.id);
        const delivery = await resolveFileDelivery(file.fileName);

        res.set("Cache-Control", IMMUTABLE_CACHE);
        if (delivery.kind === "redirect") {
            return res.redirect(delivery.url);
        }
        res.type(file.mimeType);
        return res.sendFile(delivery.absolutePath);
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
