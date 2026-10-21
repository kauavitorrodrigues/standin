import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PROFILE_PICTURE } from "@standin/contracts";
import { parseAvatarUrl } from "../../utils/parseAvatarUrl";
import { downloadAvatar } from "../downloadAvatar";

const fetchMock = vi.fn();
const AVATAR = "https://avatars.githubusercontent.com/u/583231?v=4";
const BYTES = Buffer.from("fake image bytes");

const bytesResponse = (headers: Record<string, string> = {}) =>
    new Response(new Uint8Array(BYTES), { status: 200, headers });

const redirectTo = (location: string) =>
    new Response(null, { status: 302, headers: { location } });

describe("downloadAvatar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => vi.unstubAllGlobals());

    it("returns the bytes of the photo", async () => {
        fetchMock.mockResolvedValue(bytesResponse());

        expect(await downloadAvatar(AVATAR)).toEqual(BYTES);
    });

    it("asks GitHub for the 256 size and does not follow redirects by itself", async () => {
        fetchMock.mockResolvedValue(bytesResponse());

        await downloadAvatar(AVATAR);

        const [url, init] = fetchMock.mock.calls[0];
        expect(url.toString()).toBe(
            "https://avatars.githubusercontent.com/u/583231?v=4&s=256"
        );
        expect(init.redirect).toBe("manual");
        expect(init.signal).toBeInstanceOf(AbortSignal);
    });

    it("follows a redirect inside the avatar host", async () => {
        fetchMock
            .mockResolvedValueOnce(
                redirectTo("https://avatars.githubusercontent.com/u/9?s=256")
            )
            .mockResolvedValueOnce(bytesResponse());

        expect(await downloadAvatar(AVATAR)).toEqual(BYTES);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("refuses a redirect to another host", async () => {
        fetchMock.mockResolvedValue(
            redirectTo("https://evil.example.com/a.png")
        );

        expect(await downloadAvatar(AVATAR)).toBeNull();
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("refuses a redirect to http", async () => {
        fetchMock.mockResolvedValue(
            redirectTo("http://avatars.githubusercontent.com/u/9")
        );

        expect(await downloadAvatar(AVATAR)).toBeNull();
    });

    it("gives up after too many redirects", async () => {
        fetchMock.mockImplementation(async () =>
            redirectTo("https://avatars.githubusercontent.com/u/9")
        );

        expect(await downloadAvatar(AVATAR)).toBeNull();
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it.each([
        ["another host", "https://evil.example.com/u/1"],
        [
            "a look-alike host",
            "https://avatars.githubusercontent.com.evil.dev/u/1",
        ],
        ["a subdomain", "https://x.avatars.githubusercontent.com/u/1"],
        ["plain http", "http://avatars.githubusercontent.com/u/1"],
        [
            "credentials in the url",
            "https://a:b@avatars.githubusercontent.com/u/1",
        ],
        ["a custom port", "https://avatars.githubusercontent.com:8443/u/1"],
        ["a url that does not parse", "not a url"],
    ])("never downloads from %s", async (_name, url) => {
        expect(await downloadAvatar(url)).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("does nothing when GitHub gave no avatar", async () => {
        expect(await downloadAvatar(null)).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("refuses a photo that declares a size over the limit", async () => {
        fetchMock.mockResolvedValue(
            bytesResponse({
                "content-length": String(PROFILE_PICTURE.maxBytes + 1),
            })
        );

        expect(await downloadAvatar(AVATAR)).toBeNull();
    });

    it("stops reading a body that grows over the limit", async () => {
        const chunk = new Uint8Array(1024 * 1024);
        let sent = 0;
        const body = new ReadableStream<Uint8Array>({
            pull(controller) {
                sent += 1;
                controller.enqueue(chunk);
                if (sent > 50) controller.close();
            },
        });
        fetchMock.mockResolvedValue(new Response(body, { status: 200 }));

        expect(await downloadAvatar(AVATAR)).toBeNull();
        expect(sent).toBeLessThan(10);
    });

    it("never throws on a timeout", async () => {
        fetchMock.mockRejectedValue(
            new DOMException("timed out", "TimeoutError")
        );

        expect(await downloadAvatar(AVATAR)).toBeNull();
        expect(console.error).toHaveBeenCalled();
    });

    it("gives null on an HTTP error", async () => {
        fetchMock.mockResolvedValue(new Response("nope", { status: 500 }));

        expect(await downloadAvatar(AVATAR)).toBeNull();
    });
});

describe("parseAvatarUrl", () => {
    it("accepts a relative redirect on the same host", () => {
        expect(
            parseAvatarUrl(
                "/u/9?s=256",
                "https://avatars.githubusercontent.com/u/1"
            )?.toString()
        ).toBe("https://avatars.githubusercontent.com/u/9?s=256");
    });
});
