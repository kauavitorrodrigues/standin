// What a render pass costs in GL calls, counted by wrapping the methods of the
// context. A tool for development: nothing in the game imports it, and the
// wrappers are taken off when the count ends.

const GL_TRIANGLES = 4;

const CLEAR = ["clear"];
const DRAW = [
    "drawArrays",
    "drawElements",
    "drawArraysInstanced",
    "drawElementsInstanced",
    "drawRangeElements",
];
const UPLOAD = [
    "texImage2D",
    "texSubImage2D",
    "bufferData",
    "bufferSubData",
];

export type GlCallCounts = {
    clear: number;
    draw: number;
    bind: number;
    upload: number;
};

export type GlProfile = {
    seconds: number;
    passes: number;
    passesPerSecond: number;
    calls: GlCallCounts;
    // Rectangles drawn, counting six vertices as one quad.
    quads: number;
    drawsPerPass: number;
    quadsPerPass: number;
};

type Gl = Record<string, unknown> & { TRIANGLES?: number };
type Method = (...args: unknown[]) => unknown;

const categoryOf = (name: string): keyof GlCallCounts | null => {
    if (CLEAR.includes(name)) return "clear";
    if (DRAW.includes(name)) return "draw";
    if (UPLOAD.includes(name)) return "upload";
    if (name.startsWith("bind")) return "bind";
    return null;
};

// A draw adds the quads it asks for. Only triangles are counted, which is all
// the batcher of the game draws.
const quadsOf = (name: string, args: unknown[], gl: Gl): number => {
    const triangles = gl.TRIANGLES ?? GL_TRIANGLES;
    if (args[0] !== triangles) return 0;
    const count =
        name === "drawArrays" || name === "drawArraysInstanced"
            ? args[2]
            : args[1];
    return typeof count === "number" ? count / 6 : 0;
};

/**
 * Counts the calls on one GL context between `start` and `stop`. The wrappers
 * are own properties of the context that shadow the methods of its prototype,
 * so taking them off leaves the context as it was.
 */
export class GlCallCounter {
    private readonly gl: Gl;
    private readonly wrapped: string[] = [];
    private counts: GlCallCounts = { clear: 0, draw: 0, bind: 0, upload: 0 };
    private quads = 0;

    constructor(gl: object) {
        this.gl = gl as Gl;
    }

    start(): void {
        if (this.wrapped.length > 0) return;
        this.counts = { clear: 0, draw: 0, bind: 0, upload: 0 };
        this.quads = 0;

        const gl = this.gl;
        const names = new Set<string>();
        for (let proto: object | null = gl; proto; proto = Object.getPrototypeOf(proto)) {
            Object.getOwnPropertyNames(proto).forEach((name) => names.add(name));
        }
        names.forEach((name) => {
            const category = categoryOf(name);
            const original = gl[name];
            if (!category || typeof original !== "function") return;

            gl[name] = (...args: unknown[]) => {
                this.counts[category] += 1;
                if (category === "draw") this.quads += quadsOf(name, args, gl);
                return (original as Method).apply(gl, args);
            };
            this.wrapped.push(name);
        });
    }

    stop(): { calls: GlCallCounts; quads: number } {
        this.wrapped.forEach((name) => delete this.gl[name]);
        this.wrapped.length = 0;
        return { calls: { ...this.counts }, quads: this.quads };
    }
}

type ProfileOptions = {
    gl: object;
    // How many render passes the game has drawn so far.
    getPasses: () => number;
    seconds: number;
    wait?: (ms: number) => Promise<void>;
};

/**
 * Counts the GL calls of the game for a number of seconds and says what a pass
 * cost: draws and quads per pass, and how many passes ran per second. A pass
 * that does not happen costs no calls, so an idle scene shows 0 passes.
 */
export const profileGl = async ({
    gl,
    getPasses,
    seconds,
    wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}: ProfileOptions): Promise<GlProfile> => {
    const counter = new GlCallCounter(gl);
    const passesBefore = getPasses();
    counter.start();
    await wait(seconds * 1000);
    const { calls, quads } = counter.stop();
    const passes = getPasses() - passesBefore;

    return {
        seconds,
        passes,
        passesPerSecond: passes / seconds,
        calls,
        quads,
        drawsPerPass: passes > 0 ? calls.draw / passes : 0,
        quadsPerPass: passes > 0 ? quads / passes : 0,
    };
};

/** One line with what a profile found, for the console. */
export const formatGlProfile = (profile: GlProfile): string => {
    const { calls } = profile;
    return [
        `[gl] ${profile.seconds}s:`,
        `${profile.passes} passes (${profile.passesPerSecond.toFixed(1)}/s),`,
        `${profile.drawsPerPass.toFixed(1)} draws and`,
        `${profile.quadsPerPass.toFixed(0)} quads per pass,`,
        `calls: clear ${calls.clear}, draw ${calls.draw},`,
        `bind ${calls.bind}, upload ${calls.upload}`,
    ].join(" ");
};
