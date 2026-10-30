import { describe, expect, it } from "vitest";
import { checkClipLimits } from "../../lib/checkClipLimits";
import { resolveUploadBlockReason } from "../resolveUploadBlockReason";

describe("resolveUploadBlockReason", () => {
    it("blocks over the duration limit", () => {
        expect(resolveUploadBlockReason(checkClipLimits(11000))).toContain(
            "10 segundos"
        );
    });

    it("blocks an empty selection", () => {
        expect(resolveUploadBlockReason(checkClipLimits(0))).toContain(
            "Selecione"
        );
    });

    it("lets a valid clip through", () => {
        expect(resolveUploadBlockReason(checkClipLimits(2000))).toBeNull();
    });
});
