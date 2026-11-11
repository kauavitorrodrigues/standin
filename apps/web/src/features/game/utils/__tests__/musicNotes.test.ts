import { describe, expect, it } from "vitest";
import { MUSIC_NOTE } from "@/features/game/consts/musicNotes";
import { buildMusicNote } from "../buildMusicNote";
import { isMotionReduced } from "../isMotionReduced";
import {
    advanceMusicNote,
    getMusicNoteAlpha,
    isMusicNoteDone,
} from "../stepMusicNote";
import { nextFirstNoteDelay, stepNoteSpawnTimer } from "../stepNoteSpawnTimer";

const middle = () => 0.5;

describe("isMotionReduced", () => {
    it.each([
        [false, false, false],
        [true, false, true],
        [false, true, true],
        [true, true, true],
    ])("system %s and app %s gives %s", (system, app, expected) => {
        expect(isMotionReduced(system, app)).toBe(expected);
    });
});

describe("stepNoteSpawnTimer", () => {
    it("waits while time is left", () => {
        expect(stepNoteSpawnTimer(500, 100, middle)).toEqual({
            remainingMs: 400,
            shouldSpawn: false,
        });
    });

    it("spawns when the time runs out and starts a new wait inside the interval", () => {
        const step = stepNoteSpawnTimer(50, 100, middle);

        expect(step.shouldSpawn).toBe(true);
        expect(step.remainingMs).toBeGreaterThanOrEqual(
            MUSIC_NOTE.SPAWN_INTERVAL_MIN_MS
        );
        expect(step.remainingMs).toBeLessThanOrEqual(
            MUSIC_NOTE.SPAWN_INTERVAL_MAX_MS
        );
    });

    it("makes the first note come sooner than the regular rhythm", () => {
        const delay = nextFirstNoteDelay(middle);

        expect(delay).toBeGreaterThanOrEqual(
            MUSIC_NOTE.FIRST_NOTE_DELAY_MIN_MS
        );
        expect(delay).toBeLessThanOrEqual(MUSIC_NOTE.FIRST_NOTE_DELAY_MAX_MS);
        expect(delay).toBeLessThan(MUSIC_NOTE.SPAWN_INTERVAL_MIN_MS);
    });

    it("throws one note for a very long frame, not a burst", () => {
        const step = stepNoteSpawnTimer(50, 10_000, middle);

        expect(step.shouldSpawn).toBe(true);
        expect(step.remainingMs).toBeGreaterThan(0);
    });
});

describe("music note movement", () => {
    it("starts at the point, within the spread, and young", () => {
        const note = buildMusicNote({ x: 100, y: 200, random: middle });

        expect(note.y).toBe(200);
        expect(Math.abs(note.x - 100)).toBeLessThanOrEqual(
            MUSIC_NOTE.SPAWN_SPREAD_PX
        );
        expect(note.ageMs).toBe(0);
    });

    it("rises and sways around its column", () => {
        const note = buildMusicNote({ x: 100, y: 200, random: middle });

        advanceMusicNote(note, 500);

        expect(note.y).toBeLessThan(200);
        expect(Math.abs(note.x - note.originX)).toBeLessThanOrEqual(
            MUSIC_NOTE.SWAY_AMPLITUDE_MAX
        );
    });

    it("is done once its life is over", () => {
        const note = buildMusicNote({ x: 0, y: 0, random: middle });

        expect(isMusicNoteDone(note)).toBe(false);
        advanceMusicNote(note, note.lifeMs);
        expect(isMusicNoteDone(note)).toBe(true);
    });

    it("fades in, stays, then fades out", () => {
        const note = buildMusicNote({ x: 0, y: 0, random: middle });

        note.ageMs = 0;
        expect(getMusicNoteAlpha(note)).toBe(0);
        note.ageMs = note.lifeMs * 0.4;
        expect(getMusicNoteAlpha(note)).toBe(1);
        note.ageMs = note.lifeMs * 0.9;
        expect(getMusicNoteAlpha(note)).toBeGreaterThan(0);
        expect(getMusicNoteAlpha(note)).toBeLessThan(1);
        note.ageMs = note.lifeMs;
        expect(getMusicNoteAlpha(note)).toBe(0);
    });
});
