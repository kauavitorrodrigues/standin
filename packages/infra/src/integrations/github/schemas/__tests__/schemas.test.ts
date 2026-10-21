import { describe, expect, it } from "vitest";
import { EmailListSchema } from "../email-list.schema";
import { TokenResponseSchema } from "../token-response.schema";
import { UserProfileSchema } from "../user-profile.schema";

describe("TokenResponseSchema", () => {
    it("takes a body with a token", () => {
        expect(TokenResponseSchema.parse({ access_token: "gho_x" })).toEqual({
            access_token: "gho_x",
        });
    });

    it("refuses the error body GitHub sends with a 200", () => {
        expect(
            TokenResponseSchema.safeParse({ error: "bad_verification_code" })
                .success
        ).toBe(false);
    });

    it("refuses an empty token", () => {
        expect(
            TokenResponseSchema.safeParse({ access_token: "" }).success
        ).toBe(false);
    });

    it("strips fields it does not know", () => {
        expect(
            TokenResponseSchema.parse({
                access_token: "t",
                token_type: "bearer",
            })
        ).toEqual({ access_token: "t" });
    });
});

describe("UserProfileSchema", () => {
    it("takes a full profile", () => {
        expect(
            UserProfileSchema.parse({
                id: 1,
                login: "a",
                name: "A",
                avatar_url: "https://x",
            })
        ).toEqual({ id: 1, login: "a", name: "A", avatar_url: "https://x" });
    });

    it("accepts a null or missing name and avatar", () => {
        expect(
            UserProfileSchema.safeParse({ id: 1, login: "a", name: null })
                .success
        ).toBe(true);
    });

    it.each([
        ["no id", { login: "a" }],
        ["no login", { id: 1 }],
        ["an id that is not a positive integer", { id: 0, login: "a" }],
        ["an id as text", { id: "1", login: "a" }],
    ])("refuses %s", (_name, payload) => {
        expect(UserProfileSchema.safeParse(payload).success).toBe(false);
    });

    it("strips the untrusted e-mail and other fields", () => {
        const parsed = UserProfileSchema.parse({
            id: 1,
            login: "a",
            email: "untrusted@example.com",
        });

        expect(parsed).not.toHaveProperty("email");
    });
});

describe("EmailListSchema", () => {
    it("takes a list of e-mails", () => {
        const list = [{ email: "a@b.dev", primary: true, verified: true }];

        expect(EmailListSchema.parse(list)).toEqual(list);
    });

    it("takes an empty list", () => {
        expect(EmailListSchema.parse([])).toEqual([]);
    });

    it("refuses an entry missing a flag", () => {
        expect(
            EmailListSchema.safeParse([{ email: "a@b.dev", primary: true }])
                .success
        ).toBe(false);
    });

    it("refuses a body that is not a list", () => {
        expect(EmailListSchema.safeParse({ message: "hi" }).success).toBe(
            false
        );
    });

    it("strips fields it does not know", () => {
        expect(
            EmailListSchema.parse([
                {
                    email: "a@b.dev",
                    primary: true,
                    verified: true,
                    visibility: "public",
                },
            ])
        ).toEqual([{ email: "a@b.dev", primary: true, verified: true }]);
    });
});
