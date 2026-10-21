import type { Response } from "express";

const TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Puts the session token in the `token` cookie. Sign in, sign up and the
 * GitHub callback share it, so the session looks the same whatever way the
 * person entered.
 */
export const setTokenCookie = (res: Response, token: string) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: TOKEN_COOKIE_MAX_AGE_MS,
    });
};
