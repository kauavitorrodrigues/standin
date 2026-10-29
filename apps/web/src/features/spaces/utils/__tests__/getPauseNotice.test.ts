import { describe, expect, it } from "vitest";
import { MEDIA_PAUSE_REASONS } from "@standin/contracts";
import { getPauseNotice } from "../getPauseNotice";

describe("getPauseNotice", () => {
    it("has a short and a whole sentence for every reason", () => {
        Object.values(MEDIA_PAUSE_REASONS).forEach((reason) => {
            const notice = getPauseNotice(reason);
            expect(notice.short.length).toBeGreaterThan(0);
            expect(notice.full.length).toBeGreaterThanOrEqual(notice.short.length);
        });
    });

    it("says it is to save the machine of the viewer, or to ease the server", () => {
        expect(getPauseNotice("client-limit").short).toContain("economizar a sua máquina");
        expect(getPauseNotice("server-limit").short).toContain("servidor");
    });

    it("says the video is hidden when the viewer hid it", () => {
        expect(getPauseNotice("user-hidden").short).toBe("Vídeo oculto");
    });
});
