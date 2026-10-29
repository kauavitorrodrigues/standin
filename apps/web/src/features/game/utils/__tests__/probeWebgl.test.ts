import { describe, expect, it, vi } from "vitest";
import {
    isSoftwareRenderer,
    probeWebgl,
} from "@/features/game/utils/probeWebgl";

const UNMASKED_RENDERER = 37446;

const buildCanvas = (gl: unknown) =>
    ({ getContext: vi.fn(() => gl) }) as unknown as HTMLCanvasElement;

const buildGl = (renderer: string | null) => {
    const loseContext = vi.fn();
    const gl = {
        getExtension: vi.fn((name: string) => {
            if (name === "WEBGL_debug_renderer_info") {
                return renderer === null
                    ? null
                    : { UNMASKED_RENDERER_WEBGL: UNMASKED_RENDERER };
            }
            if (name === "WEBGL_lose_context") return { loseContext };
            return null;
        }),
        getParameter: vi.fn(() => renderer),
    };
    return { gl, loseContext };
};

describe("isSoftwareRenderer", () => {
    it.each([
        "Google SwiftShader",
        "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device), SwiftShader driver)",
        "llvmpipe (LLVM 15.0.7, 256 bits)",
        "Microsoft Basic Render Driver",
    ])("knows %s as a renderer of the CPU", (name) => {
        expect(isSoftwareRenderer(name)).toBe(true);
    });

    it("does not take a GPU, or an unknown name, for the CPU", () => {
        expect(isSoftwareRenderer("NVIDIA GeForce RTX 3060")).toBe(false);
        expect(isSoftwareRenderer("Apple M2")).toBe(false);
        expect(isSoftwareRenderer(null)).toBe(false);
    });
});

describe("probeWebgl", () => {
    it("is ok with a context of the GPU, and gives the context back", () => {
        const { gl, loseContext } = buildGl("NVIDIA GeForce RTX 3060");

        expect(probeWebgl(() => buildCanvas(gl))).toEqual({
            status: "ok",
            renderer: "NVIDIA GeForce RTX 3060",
        });
        expect(loseContext).toHaveBeenCalledOnce();
    });

    it("is ok when the browser does not tell the renderer", () => {
        const { gl } = buildGl(null);

        expect(probeWebgl(() => buildCanvas(gl))).toEqual({
            status: "ok",
            renderer: null,
        });
    });

    it("is software when the renderer runs on the CPU", () => {
        const { gl } = buildGl("Google SwiftShader");

        expect(probeWebgl(() => buildCanvas(gl)).status).toBe("software");
    });

    it("is unsupported when the browser gives no context", () => {
        expect(probeWebgl(() => buildCanvas(null))).toEqual({
            status: "unsupported",
            renderer: null,
        });
    });

    it("is unsupported when asking for a context throws", () => {
        const canvas = {
            getContext: () => {
                throw new Error("blocked");
            },
        } as unknown as HTMLCanvasElement;

        expect(probeWebgl(() => canvas).status).toBe("unsupported");
    });
});
