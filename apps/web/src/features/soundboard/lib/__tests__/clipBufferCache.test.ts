import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CLIP_CACHE_MAX_ENTRIES } from "../../consts/cache";

vi.mock("@/lib/api/url", () => ({ API_BASE_URL: "http://api" }));

const decodeAudioData = vi.fn();
const fetchMock = vi.fn();

const loadModule = async () => {
    vi.resetModules();
    return import("../clipBufferCache");
};

const clip = (id: string) => ({ id, fileUrl: `/files/${id}` });

describe("getClipBuffer", () => {
    beforeEach(() => {
        decodeAudioData.mockReset();
        decodeAudioData.mockImplementation(() => Promise.resolve({}));
        fetchMock.mockReset();
        fetchMock.mockImplementation(() =>
            Promise.resolve({
                ok: true,
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)),
            })
        );
        vi.stubGlobal("fetch", fetchMock);
        vi.stubGlobal(
            "OfflineAudioContext",
            vi.fn(function () {
                return { decodeAudioData };
            })
        );
    });

    afterEach(() => vi.unstubAllGlobals());

    it("downloads a clip once for repeated plays", async () => {
        const { getClipBuffer } = await loadModule();

        await getClipBuffer(clip("a"));
        await getClipBuffer(clip("a"));

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("shares one download between plays that overlap", async () => {
        const { getClipBuffer } = await loadModule();

        await Promise.all([getClipBuffer(clip("a")), getClipBuffer(clip("a"))]);

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("uses one decode context for every clip", async () => {
        const { getClipBuffer } = await loadModule();

        await getClipBuffer(clip("a"));
        await getClipBuffer(clip("b"));

        expect(OfflineAudioContext).toHaveBeenCalledTimes(1);
    });

    it("evicts the least recently used clip past the limit", async () => {
        const { getClipBuffer } = await loadModule();
        for (let index = 0; index < CLIP_CACHE_MAX_ENTRIES; index++) {
            await getClipBuffer(clip(`c${index}`));
        }
        // Touch the oldest so the second oldest becomes the one to go.
        await getClipBuffer(clip("c0"));
        await getClipBuffer(clip("extra"));
        fetchMock.mockClear();

        await getClipBuffer(clip("c0"));
        expect(fetchMock).not.toHaveBeenCalled();

        await getClipBuffer(clip("c1"));
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("does not keep a failed download", async () => {
        const { getClipBuffer } = await loadModule();
        fetchMock.mockImplementationOnce(() => Promise.resolve({ ok: false }));

        await expect(getClipBuffer(clip("a"))).rejects.toThrow();
        await getClipBuffer(clip("a"));

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("reports a clip that cannot be decoded", async () => {
        const { getClipBuffer } = await loadModule();
        decodeAudioData.mockImplementationOnce(() =>
            Promise.reject(new DOMException("bad"))
        );

        await expect(getClipBuffer(clip("a"))).rejects.toThrow();
    });
});
