import { describe, expect, it, vi } from "vitest";
import {
    GlCallCounter,
    formatGlProfile,
    profileGl,
} from "../glCallProfiler";

// A context like the browser's: the methods live on the prototype.
class FakeGlPrototype {
    TRIANGLES = 4;
    LINES = 1;
    clearCalls = 0;
    clear() {
        this.clearCalls += 1;
    }
    drawElements(...args: unknown[]) {
        void args;
    }
    drawArrays(...args: unknown[]) {
        void args;
    }
    bindTexture(...args: unknown[]) {
        void args;
    }
    bindBuffer(...args: unknown[]) {
        void args;
    }
    texImage2D() {}
    bufferData() {}
    viewport() {}
}

describe("GlCallCounter", () => {
    it("counts calls by kind and the quads that were drawn", () => {
        const gl = new FakeGlPrototype();
        const counter = new GlCallCounter(gl);
        counter.start();

        gl.clear();
        gl.bindTexture(0, null);
        gl.bindBuffer(0, null);
        gl.drawElements(gl.TRIANGLES, 600, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 12);
        gl.texImage2D();
        gl.viewport();
        const { calls, quads } = counter.stop();

        expect(calls).toEqual({ clear: 1, draw: 2, bind: 2, upload: 1 });
        expect(quads).toBe(100 + 2);
    });

    it("does not count the quads of a draw that is not made of triangles", () => {
        const gl = new FakeGlPrototype();
        const counter = new GlCallCounter(gl);
        counter.start();
        gl.drawElements(gl.LINES, 600, 0, 0);

        expect(counter.stop().quads).toBe(0);
    });

    it("still runs the original methods", () => {
        const gl = new FakeGlPrototype();
        const counter = new GlCallCounter(gl);
        counter.start();
        gl.clear();
        gl.clear();
        counter.stop();

        expect(gl.clearCalls).toBe(2);
    });

    it("leaves the context as it was when it stops", () => {
        const gl = new FakeGlPrototype();
        const counter = new GlCallCounter(gl);
        counter.start();
        counter.stop();

        expect(Object.getOwnPropertyNames(gl)).not.toContain("clear");
        expect(Object.getOwnPropertyNames(gl)).not.toContain("drawElements");
        gl.clear();
        expect(counter.stop().calls.clear).toBe(0);
    });

    it("starts counting from zero each time", () => {
        const gl = new FakeGlPrototype();
        const counter = new GlCallCounter(gl);
        counter.start();
        gl.clear();
        counter.stop();
        counter.start();

        expect(counter.stop().calls.clear).toBe(0);
    });
});

describe("profileGl", () => {
    it("says what a pass cost over the time asked", async () => {
        const gl = new FakeGlPrototype();
        let passes = 10;
        const wait = vi.fn(async () => {
            // Five passes in the window, each with 3 draws of 250 quads in all.
            for (let i = 0; i < 5; i++) {
                passes += 1;
                gl.clear();
                gl.drawElements(gl.TRIANGLES, 6 * 100, 0, 0);
                gl.drawElements(gl.TRIANGLES, 6 * 100, 0, 0);
                gl.drawElements(gl.TRIANGLES, 6 * 50, 0, 0);
            }
        });

        const profile = await profileGl({ gl, getPasses: () => passes, seconds: 2, wait });

        expect(wait).toHaveBeenCalledWith(2000);
        expect(profile.passes).toBe(5);
        expect(profile.passesPerSecond).toBe(2.5);
        expect(profile.drawsPerPass).toBe(3);
        expect(profile.quadsPerPass).toBe(250);
        expect(profile.calls.clear).toBe(5);
    });

    it("an idle scene shows no passes and no calls", async () => {
        const gl = new FakeGlPrototype();
        const profile = await profileGl({
            gl,
            getPasses: () => 7,
            seconds: 5,
            wait: async () => undefined,
        });

        expect(profile).toMatchObject({
            passes: 0,
            passesPerSecond: 0,
            drawsPerPass: 0,
            quadsPerPass: 0,
        });
        expect(profile.calls).toEqual({ clear: 0, draw: 0, bind: 0, upload: 0 });
    });
});

describe("formatGlProfile", () => {
    it("puts the passes, the draws and the quads in one line", () => {
        const line = formatGlProfile({
            seconds: 5,
            passes: 180,
            passesPerSecond: 36,
            calls: { clear: 180, draw: 540, bind: 900, upload: 0 },
            quads: 45000,
            drawsPerPass: 3,
            quadsPerPass: 250,
        });

        expect(line).toContain("180 passes (36.0/s)");
        expect(line).toContain("3.0 draws and 250 quads per pass");
    });
});
