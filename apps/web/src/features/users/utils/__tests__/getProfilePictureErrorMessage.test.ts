import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { PROFILE_PICTURE_ERROR_MESSAGES } from "../../consts/messages";
import { getProfilePictureErrorMessage } from "../getProfilePictureErrorMessage";

const refusal = (status: number, code: string) =>
    new AxiosError("failed", undefined, undefined, undefined, {
        status,
        data: { error: "x", code },
    } as never);

describe("getProfilePictureErrorMessage", () => {
    it.each([
        [422, "PROFILE_PICTURE_INVALID"],
        [413, "PROFILE_PICTURE_TOO_LARGE"],
        [415, "PROFILE_PICTURE_UNSUPPORTED_MEDIA"],
    ] as const)("tells the person what %s %s means", (status, code) => {
        expect(getProfilePictureErrorMessage(refusal(status, code))).toBe(
            PROFILE_PICTURE_ERROR_MESSAGES[code]
        );
    });

    it("uses the fallback for anything else", () => {
        expect(getProfilePictureErrorMessage(new Error("boom"), "Falhou")).toBe(
            "Falhou"
        );
        expect(
            getProfilePictureErrorMessage(refusal(500, "OTHER"), "Falhou")
        ).toBe("Falhou");
    });
});
