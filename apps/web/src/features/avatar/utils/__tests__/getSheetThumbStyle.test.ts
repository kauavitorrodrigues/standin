import { describe, expect, it } from "vitest";
import { AVATAR, AVATAR_SHEET_PX } from "@standin/contracts";
import { getSheetThumbStyle } from "../admin/getSheetThumbStyle";

describe("getSheetThumbStyle", () => {
    it("scales the first frame by a whole number to fit the box", () => {
        const style = getSheetThumbStyle("/a.png", 96);
        const scale = Math.floor(96 / Math.max(AVATAR.frame.w, AVATAR.frame.h));

        expect(style.width).toBe(AVATAR.frame.w * scale);
        expect(style.height).toBe(AVATAR.frame.h * scale);
        expect(style.backgroundSize).toBe(
            `${AVATAR_SHEET_PX.w * scale}px ${AVATAR_SHEET_PX.h * scale}px`
        );
    });

    it("keeps the scale at 1 when the box is smaller than the frame", () => {
        const style = getSheetThumbStyle("/a.png", 10);

        expect(style.width).toBe(AVATAR.frame.w);
        expect(style.height).toBe(AVATAR.frame.h);
    });

    it("points at the first frame and keeps the pixels sharp", () => {
        const style = getSheetThumbStyle("/a.png", 96);

        expect(style.backgroundImage).toBe("url(/a.png)");
        expect(style.backgroundPosition).toBe("0px 0px");
        expect(style.imageRendering).toBe("pixelated");
    });
});
