import type { RequestHandler } from "express";
import { SignUpSchema } from "@standin/contracts";
import {
    GlobalSettingsService,
    OrganizationInviteService,
    UserService,
} from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { createToken } from "../services/createToken";
import { sendSignUpError } from "../utils/sendAuthError";
import { setTokenCookie } from "../utils/setTokenCookie";

export const signup: RequestHandler = async (req, res) => {
    try {
        const data = parseSchema(SignUpSchema, req.body, res);
        if (!data) return;

        // A link of an organization is the way in while sign up is closed.
        const { inviteToken, ...account } = data;
        if (!inviteToken) await GlobalSettingsService.assertSignupOpen();

        const user = inviteToken
            ? await OrganizationInviteService.signUp(account, inviteToken)
            : await UserService.create(account);
        const token = createToken(user);

        setTokenCookie(res, token);

        res.status(201).json({ user, token });
    } catch (error) {
        return sendSignUpError(res, error);
    }
};
