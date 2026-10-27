import { describe, expect, it } from "vitest";
import { readMediaConfig } from "../readMediaConfig";

describe("readMediaConfig", () => {
    it("runs one worker on the default port", () => {
        const { enabled, options } = readMediaConfig({});
        expect(enabled).toBe(true);
        expect(options.listenPort).toBe(44444);
    });

    it("turns the server off with zero workers", () => {
        expect(readMediaConfig({ MEDIA_WORKERS: "0" }).enabled).toBe(false);
    });

    it("leaves the address to the media server when none is configured", () => {
        expect(readMediaConfig({}).options.announcedAddress).toBeUndefined();
    });

    it("announces the public address when one is configured", () => {
        const { options } = readMediaConfig({
            MEDIA_ANNOUNCED_ADDRESS: "203.0.113.7",
        });
        expect(options.announcedAddress).toBe("203.0.113.7");
    });

    it("announces nothing extra when it listens on one specific address", () => {
        const { options } = readMediaConfig({
            MEDIA_LISTEN_IP: "192.168.0.10",
        });
        expect(options.announcedAddress).toBeUndefined();
    });
});
