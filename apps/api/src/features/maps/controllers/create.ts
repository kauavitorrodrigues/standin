import type { Response } from "express";
import {
    MapDataSchema,
    MissingMapJsonFileError,
    MissingTilesetImageError,
} from "@standin/contracts";
import { MapService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const createMap = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res,
        );
        if (!params) return;

        const data = parseSchema(
            MapDataSchema,
            {
                name: req.body.name,
                width: Number(req.body.width),
                height: Number(req.body.height),
                tileSize: Number(req.body.tileSize),
            },
            res,
        );
        if (!data) return;

        const files = req.files as
            | Record<string, Express.Multer.File[]>
            | undefined;

        const mapJsonFile = files?.mapJsonFile?.[0];
        if (!mapJsonFile) throw new MissingMapJsonFileError();

        const tilesetImages = files?.tilesetImages ?? [];
        if (tilesetImages.length === 0) throw new MissingTilesetImageError();

        const map = await MapService.create({
            organizationId: params.organizationId,
            createdBy: req.user?.id,
            data,
            mapJsonFile,
            tilesetImages,
        });

        res.status(201).json({ map });
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "create",
            reportError: error,
        });
    }
};
