import type { RequestHandler } from "express";
import { UserDataSchema } from "@standin/contracts";
import { UserService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { createToken } from "../services/createToken";
import { sendSignUpError } from "../utils/sendAuthError";

export const signup: RequestHandler = async (req, res) => {
    try {
        const data = parseSchema(UserDataSchema, req.body, res);
        if (!data) return;

        const user = await UserService.create(data);
        const token = createToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({ user, token });
    } catch (error) {
        return sendSignUpError(res, error);
    }
};
