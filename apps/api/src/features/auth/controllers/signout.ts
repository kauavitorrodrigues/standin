import type { Response } from "express";
import type { ExtendedRequest } from "@/types/request";

export const signout = async (_req: ExtendedRequest, res: Response) => {
    res.clearCookie("token");
    res.status(200).json({ success: true });
};
