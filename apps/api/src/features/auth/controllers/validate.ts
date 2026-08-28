import type { Response } from "express";
import type { ExtendedRequest } from "@/types/request";

export const validate = async (req: ExtendedRequest, res: Response) => {
    res.status(200).json({ user: req.user });
};
