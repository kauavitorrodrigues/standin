// "ok": the browser gave a context drawn by the GPU. "software": it gave one
// drawn by the CPU, which works but is slow. "unsupported": it gave none.
export type WebglStatus = "ok" | "software" | "unsupported";

export type WebglProbe = {
    status: WebglStatus;
    // The name of the renderer when the browser tells it.
    renderer: string | null;
};

// The names the browsers give to a renderer that runs on the CPU.
const SOFTWARE_RENDERERS =
    /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i;

export const isSoftwareRenderer = (renderer: string | null): boolean =>
    renderer !== null && SOFTWARE_RENDERERS.test(renderer);

type WebglContext = WebGLRenderingContext | WebGL2RenderingContext;

const readRenderer = (gl: WebglContext): string | null => {
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    if (!info) return null;

    const name: unknown = gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
    return typeof name === "string" ? name : null;
};

/**
 * Asks the browser for a WebGL context on a canvas of its own and says what
 * came back. A context is given up right after, so the check costs nothing
 * while the game runs. The browser may refuse to give one even with the GPU
 * there (a blocklist), and then the game would not have one either.
 */
export const probeWebgl = (
    createCanvas: () => HTMLCanvasElement = () =>
        document.createElement("canvas")
): WebglProbe => {
    try {
        const canvas = createCanvas();
        const gl = (canvas.getContext("webgl") ??
            canvas.getContext("experimental-webgl")) as WebglContext | null;
        if (!gl) return { status: "unsupported", renderer: null };

        const renderer = readRenderer(gl);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return {
            status: isSoftwareRenderer(renderer) ? "software" : "ok",
            renderer,
        };
    } catch {
        return { status: "unsupported", renderer: null };
    }
};

let cached: WebglProbe | null = null;

// The probe is made once per page: the answer does not change while it runs.
export const getWebglProbe = (): WebglProbe => (cached ??= probeWebgl());
