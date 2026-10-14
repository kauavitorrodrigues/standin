import { describe, expect, it, vi } from "vitest";
import { TILE_SIZE } from "@standin/contracts";
import { EditorCameraController } from "@/features/maps/__shared__/lib/EditorCameraController";

describe("EditorCameraController.focusCell", () => {
    it("centers the camera on the middle of the cell, keeping the zoom", () => {
        const centerOn = vi.fn();
        const setZoom = vi.fn();
        const camera = {
            width: 800,
            height: 600,
            centerOn,
            setZoom,
        };
        const controller = new EditorCameraController(
            camera as never,
            640,
            640,
            2,
            vi.fn()
        );

        controller.focusCell([3, 5]);

        expect(centerOn).toHaveBeenCalledWith(
            3 * TILE_SIZE + TILE_SIZE / 2,
            5 * TILE_SIZE + TILE_SIZE / 2
        );
        expect(setZoom).not.toHaveBeenCalled();
        expect(controller.getZoom()).toBe(2);
    });
});
