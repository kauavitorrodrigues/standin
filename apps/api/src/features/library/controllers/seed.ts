import type { Response } from "express";
import { z } from "zod/v4";
import { AssetService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError, sendUnauthorizedError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { readSeedParts } from "../utils/readSeedParts";

const SeedQuerySchema = z.object({
    dryRun: z.enum(["true", "false"]).optional(),
});

// Seeds the global library from library.json and its PNGs. With
// `?dryRun=true` it only validates the upload and counts the entries.
export const seedLibrary = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return sendUnauthorizedError(res);
        const query = parseSchema(SeedQuerySchema, req.query, res);
        if (!query) return;

        const result = await AssetService.seedFromFiles(readSeedParts(req), {
            createdBy: req.user.id,
            dryRun: query.dryRun === "true",
        });
        res.status(200).json(result);
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "create",
            reportError: error,
        });
    }
};
