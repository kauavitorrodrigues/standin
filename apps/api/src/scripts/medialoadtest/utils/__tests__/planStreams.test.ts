import { describe, expect, it } from "vitest";
import { planStreams } from "../planStreams";

describe("planStreams", () => {
    const options = { speakers: 3, cameras: 2, screens: 1, layers: 1 as const };
    const counter = () => {
        let value = 100;
        return () => (value += 1);
    };

    it("gives the first people a microphone and a camera", () => {
        const next = counter();
        expect(planStreams(0, options, next)).toEqual({
            mic: 101,
            camera: [102],
            screen: null,
        });
    });

    it("gives the people after the cameras the screens", () => {
        const next = counter();
        expect(planStreams(2, options, next)).toEqual({
            mic: 101,
            camera: null,
            screen: 102,
        });
    });

    it("gives a camera one SSRC per layer", () => {
        const next = counter();
        expect(
            planStreams(0, { ...options, layers: 3 }, next).camera
        ).toEqual([102, 103, 104]);
    });

    it("gives the rest of the people nothing", () => {
        expect(planStreams(5, options, counter())).toEqual({
            mic: null,
            camera: null,
            screen: null,
        });
    });
});
