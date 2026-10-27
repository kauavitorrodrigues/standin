import { describe, expect, it } from "vitest";
import { PLAYER_DIRECTIONS } from "@standin/contracts";
import {
    ARENA_SIZE_PX,
    SEND_INTERVAL_MS,
    WALK_SPEED_PX_PER_SEC,
} from "../../consts";
import { buildSquareArena } from "../buildArena";
import { createWalker, stepWalker, type Walker } from "../stepWalker";

const arena = buildSquareArena();

const walker = (overrides: Partial<Walker>): Walker => ({
    x: 100,
    y: 100,
    direction: PLAYER_DIRECTIONS.DOWN,
    heading: null,
    remainingMs: 0,
    path: [],
    ...overrides,
});

const STEP_PX = (WALK_SPEED_PX_PER_SEC * SEND_INTERVAL_MS) / 1000;

describe("stepWalker", () => {
    it("starts inside the arena", () => {
        const start = createWalker(() => 0.999, arena);
        expect(start.x).toBeLessThanOrEqual(ARENA_SIZE_PX);
        expect(start.y).toBeLessThanOrEqual(ARENA_SIZE_PX);
    });

    it("stands still while the idle wait lasts", () => {
        const { walker: next, moved } = stepWalker(
            walker({ remainingMs: 1000 }),
            SEND_INTERVAL_MS,
            () => 0.5,
            arena
        );
        expect(moved).toBe(false);
        expect(next.remainingMs).toBe(1000 - SEND_INTERVAL_MS);
    });

    it("moves one step along the held key", () => {
        const { walker: next, moved } = stepWalker(
            walker({ heading: PLAYER_DIRECTIONS.RIGHT, remainingMs: 500 }),
            SEND_INTERVAL_MS,
            () => 0.5,
            arena
        );
        expect(moved).toBe(true);
        expect(next.x).toBe(Math.round(100 + STEP_PX));
        expect(next.y).toBe(100);
    });

    it("walks a click path along one axis at a time and then stops", () => {
        let current = walker({
            path: [
                { x: 120, y: 100 },
                { x: 120, y: 130 },
            ],
        });
        const seen: { x: number; y: number }[] = [];
        for (let i = 0; i < 10; i++) {
            const step = stepWalker(current, SEND_INTERVAL_MS, () => 0.5, arena);
            const diagonal =
                step.walker.x !== current.x && step.walker.y !== current.y;
            expect(diagonal).toBe(false);
            current = step.walker;
            seen.push({ x: current.x, y: current.y });
        }
        expect(seen).toContainEqual({ x: 120, y: 130 });
        expect(current.path).toEqual([]);
        expect(current.heading).toBeNull();
    });

    it("stops a held key at a wall instead of walking through it", () => {
        const wallArena = {
            ...arena,
            isFree: (x: number) => x < 110,
        };
        const { walker: next, moved } = stepWalker(
            walker({
                x: 108,
                heading: PLAYER_DIRECTIONS.RIGHT,
                remainingMs: 500,
            }),
            SEND_INTERVAL_MS,
            () => 0.5,
            wallArena
        );

        expect(moved).toBe(false);
        expect(next.x).toBe(108);
        expect(next.heading).toBeNull();
    });

    it("ends a click path that runs into a wall", () => {
        const wallArena = { ...arena, isFree: (x: number) => x < 110 };
        const { walker: next } = stepWalker(
            walker({ path: [{ x: 200, y: 100 }] }),
            SEND_INTERVAL_MS * 5,
            () => 0.5,
            wallArena
        );

        expect(next.path).toEqual([]);
        expect(next.x).toBe(100);
    });
});
