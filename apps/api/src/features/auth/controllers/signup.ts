import type { RequestHandler } from "express";
import { UserDataSchema } from "@standin/contracts";
import { UserService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { createToken } from "../services/createToken";
import { sendSignUpError } from "../utils/sendAuthError";
import { setTokenCookie } from "../utils/setTokenCookie";

export const signup: RequestHandler = async (req, res) => {
    try {
        const data = parseSchema(UserDataSchema, req.body, res);
        if (!data) return;

        const user = await UserService.create(data);
        const token = createToken(user);

        setTokenCookie(res, token);

        res.status(201).json({ user, token });
    } catch (error) {
        return sendSignUpError(res, error);
    }
};
