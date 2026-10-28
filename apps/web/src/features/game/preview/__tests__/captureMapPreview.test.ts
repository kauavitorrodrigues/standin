// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameMapData } from "@/features/game/types/tilemap";

type GameConfig = {
    parent: HTMLElement;
    transparent: boolean;
    audio: unknown;
    input: unknown;
};

const { gamesMade, destroyMock, sceneAddMock, bootFailure } = vi.hoisted(
    () => ({
        gamesMade: [] as { config: GameConfig }[],
        destroyMock: vi.fn(),
        sceneAddMock: vi.fn(),
        // When set, the next game fails to boot, as without WebGL or canvas.
        bootFailure: { error: null as Error | null },
    })
);

vi.mock("phaser", () => {
    class Game {
        scene = { add: sceneAddMock };
        config: GameConfig;
        constructor(config: GameConfig) {
            if (bootFailure.error) throw bootFailure.error;
            this.config = config;
            gamesMade.push(this);
        }
    }
    return { default: { Game, AUTO: "auto" } };
});
vi.mock("@/features/game/utils/game", () => ({
    destroyGameWhenReady: destroyMock,
}));
vi.mock("../MapPreviewScene", () => ({ MapPreviewScene: class {} }));

import { captureMapPreview } from "../captureMapPreview";
import { MAP_PREVIEW_CAPTURE } from "../consts";

const map = { id: "m1" } as GameMapData;
const photo = new Blob(["png"], { type: "image/png" });

// The scene the capture game boots, handing back what was passed to it.
const bootedScene = (captureThumbnail: () => Promise<Blob>) => {
    const [, , , data] = sceneAddMock.mock.calls[0];
    data.onDrawn({ captureThumbnail });
};

describe("captureMapPreview", () => {
    beforeEach(() => {
        gamesMade.length = 0;
        bootFailure.error = null;
        vi.clearAllMocks();
        document.body.innerHTML = "";
    });
    afterEach(() => vi.useRealTimers());

    it("boots a silent game that no input reaches, on a stage off the screen", () => {
        void captureMapPreview(map).catch(() => {});

        const { config } = gamesMade[0];
        expect(config.transparent).toBe(true);
        expect(config.audio).toEqual({ noAudio: true });
        expect(config.input).toEqual({
            keyboard: false,
            mouse: false,
            touch: false,
            gamepad: false,
        });
        const stage = config.parent;
        expect(stage.isConnected).toBe(true);
        expect(stage.style.left).toBe("-10000px");
        expect(stage.style.visibility).toBe("hidden");
        expect(stage.getAttribute("aria-hidden")).toBe("true");
    });

    it("gives the map to the scene", () => {
        void captureMapPreview(map).catch(() => {});

        expect(sceneAddMock.mock.calls[0][3].map).toBe(map);
    });

    it("resolves with the photo the scene took", async () => {
        const result = captureMapPreview(map);

        bootedScene(() => Promise.resolve(photo));

        await expect(result).resolves.toBe(photo);
    });

    it("tears the game and the stage down after a photo", async () => {
        const result = captureMapPreview(map);
        const stage = gamesMade[0].config.parent;

        bootedScene(() => Promise.resolve(photo));
        await result;

        expect(destroyMock).toHaveBeenCalledTimes(1);
        expect(destroyMock).toHaveBeenCalledWith(gamesMade[0]);
        expect(stage.isConnected).toBe(false);
    });

    it("rejects and still tears down when the scene cannot take the photo", async () => {
        const result = captureMapPreview(map);
        const stage = gamesMade[0].config.parent;

        bootedScene(() => Promise.reject(new Error("no texture")));

        await expect(result).rejects.toThrow("no texture");
        expect(destroyMock).toHaveBeenCalledTimes(1);
        expect(stage.isConnected).toBe(false);
    });

    it("gives up when the map never finishes drawing", async () => {
        vi.useFakeTimers();
        const result = captureMapPreview(map);
        const stage = gamesMade[0].config.parent;
        const settled = expect(result).rejects.toThrow(
            "Map thumbnail capture took too long"
        );

        await vi.advanceTimersByTimeAsync(MAP_PREVIEW_CAPTURE.TIMEOUT_MS);

        await settled;
        expect(destroyMock).toHaveBeenCalledTimes(1);
        expect(stage.isConnected).toBe(false);
    });

    it("honors a shorter timeout", async () => {
        vi.useFakeTimers();
        const result = captureMapPreview(map, 50);
        const settled = expect(result).rejects.toThrow("took too long");

        await vi.advanceTimersByTimeAsync(50);

        await settled;
    });

    it("tears down once when the photo arrives after the timeout", async () => {
        vi.useFakeTimers();
        const result = captureMapPreview(map, 50);
        const settled = expect(result).rejects.toThrow("took too long");
        await vi.advanceTimersByTimeAsync(50);
        await settled;

        bootedScene(() => Promise.resolve(photo));
        await vi.advanceTimersByTimeAsync(0);

        expect(destroyMock).toHaveBeenCalledTimes(1);
    });

    it("does not time out once the photo is taken", async () => {
        vi.useFakeTimers();
        const result = captureMapPreview(map, 50);

        bootedScene(() => Promise.resolve(photo));
        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(100);

        await expect(result).resolves.toBe(photo);
        expect(destroyMock).toHaveBeenCalledTimes(1);
    });

    it("leaves no stage behind when the game cannot boot", async () => {
        bootFailure.error = new Error("no webgl");

        await expect(captureMapPreview(map)).rejects.toThrow("no webgl");

        expect(document.body.children.length).toBe(0);
        expect(destroyMock).not.toHaveBeenCalled();
    });

    it("rejects at once when the scene throws while taking the photo", async () => {
        vi.useFakeTimers();
        const result = captureMapPreview(map);
        const stage = gamesMade[0].config.parent;
        const settled = expect(result).rejects.toThrow("scene broke");

        bootedScene(() => {
            throw new Error("scene broke");
        });

        await settled;
        expect(destroyMock).toHaveBeenCalledTimes(1);
        expect(stage.isConnected).toBe(false);
    });

    it("rejects at once when the scene fails to draw the map", async () => {
        vi.useFakeTimers();
        const result = captureMapPreview(map);
        const stage = gamesMade[0].config.parent;
        const settled = expect(result).rejects.toThrow("bad tileset");

        sceneAddMock.mock.calls[0][3].onFailed(new Error("bad tileset"));

        await settled;
        expect(destroyMock).toHaveBeenCalledTimes(1);
        expect(stage.isConnected).toBe(false);
    });
});
