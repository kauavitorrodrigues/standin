import type { Response } from "express";
import { GlobalSettingsUpdateSchema } from "@standin/contracts";
import { AdminService, GlobalSettingsService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// Open: the sign up page reads it before anyone is signed in.
const getPublicSettings = async (_req: ExtendedRequest, res: Response) => {
    try {
        const settings = await GlobalSettingsService.getPublic();
        // A change must show at once, so the answer is not cached.
        res.set("Cache-Control", "no-store");
        res.status(200).json({ settings });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};

const getCapabilities = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const capabilities = await GlobalSettingsService.getCapabilities(
            req.user
        );
        res.set("Cache-Control", "no-store");
        res.status(200).json({ capabilities });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};

const getSettings = async (_req: ExtendedRequest, res: Response) => {
    try {
        const settings = await GlobalSettingsService.get();
        res.status(200).json({ settings });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};

const updateSettings = async (req: ExtendedRequest, res: Response) => {
    try {
        const data = parseSchema(GlobalSettingsUpdateSchema, req.body, res);
        if (!data) return;

        const settings = await GlobalSettingsService.update(data);
        res.status(200).json({ settings });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};

const listUsers = async (_req: ExtendedRequest, res: Response) => {
    try {
        const users = await AdminService.listUsers();
        res.status(200).json({ users });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};

const listOrganizations = async (_req: ExtendedRequest, res: Response) => {
    try {
        const organizations = await AdminService.listOrganizations();
        res.status(200).json({ organizations });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};

export const GlobalSettingsController = {
    getPublicSettings,
    getCapabilities,
    getSettings,
    updateSettings,
    listUsers,
    listOrganizations,
};
