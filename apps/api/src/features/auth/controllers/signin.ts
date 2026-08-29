import type { RequestHandler } from "express";
import { SignInSchema } from "@standin/contracts";
import { UserService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { createToken } from "../services/createToken";
import {
    sendInvalidCredentialsError,
    sendSignInError,
} from "../utils/sendAuthError";

export const signin: RequestHandler = async (req, res) => {
    try {
        const data = parseSchema(SignInSchema, req.body, res);
        if (!data) return;

        const user = await UserService.isValid(data);
        if (!user) return sendInvalidCredentialsError(res);

        const token = createToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ user, token });
    } catch (error) {
        return sendSignInError(res, error);
    }
};
