import { describe, expect, it } from "vitest";
import { PLAYER_DIRECTIONS } from "../../../game/enums/player";
import { AVATAR_SLOT_VALUES } from "../../enums/slots";
import {
    AVATAR,
    AVATAR_ANIMATIONS,
    AVATAR_SHEET_PX,
    AVATAR_FRAME_KINDS,
    AVATAR_FRAMES,
    AVATAR_SHEET_DIRECTIONS,
    AVATAR_SHEET_SLOTS,
} from "../dimensions";
import { AVATAR_COLOR_PATTERN } from "../color";
import { AVATAR_PARTS_PAGE, AVATAR_RANDOM_CHANCE } from "../limits";
import { AVATAR_SLOT_ORDER, AVATAR_SLOT_TABS } from "../slot-order";

describe("dimensions", () => {
    it("derives the sheet size from the frame and the grid", () => {
        expect(AVATAR_SHEET_PX).toEqual({
            w: AVATAR.sheet.cols * AVATAR.frame.w,
            h: AVATAR.sheet.rows * AVATAR.frame.h,
        });
    });

    it("has every direction once", () => {
        expect(new Set(AVATAR_SHEET_DIRECTIONS)).toEqual(
            new Set(Object.values(PLAYER_DIRECTIONS))
        );
        expect(AVATAR_SHEET_DIRECTIONS).toHaveLength(4);
    });

    it("lays the frames in a single row of 72 frames of 32 x 64", () => {
        expect(AVATAR.sheet).toEqual({ cols: 72, rows: 1 });
        expect(AVATAR.frame).toEqual({ w: 32, h: 64 });
    });

    it("gives every animation frames inside the sheet for every direction", () => {
        for (const frames of Object.values(AVATAR_FRAMES)) {
            for (const direction of AVATAR_SHEET_DIRECTIONS) {
                const columns: readonly number[] = frames[direction];

                expect(columns.length).toBeGreaterThan(0);
                for (const column of columns) {
                    expect(column).toBeGreaterThanOrEqual(0);
                    expect(column).toBeLessThan(AVATAR.sheet.cols);
                }
            }
        }
    });

    it("has one slot for each frame of the sheet", () => {
        expect(AVATAR_SHEET_SLOTS).toHaveLength(AVATAR.sheet.cols);
    });

    it("puts every frame of an animation in a slot of the same direction and kind", () => {
        const kindsOf = {
            IDLE: [AVATAR_FRAME_KINDS.IDLE],
            // The blink is an idle frame with the eyes closed.
            BLINK: [AVATAR_FRAME_KINDS.IDLE],
            WALK: [AVATAR_FRAME_KINDS.WALK],
            SIT: [AVATAR_FRAME_KINDS.SIT_LEGS, AVATAR_FRAME_KINDS.SIT_CROSSED],
            EMOTE: [AVATAR_FRAME_KINDS.EMOTE],
        } as const;

        for (const [animation, frames] of Object.entries(AVATAR_FRAMES)) {
            const allowed: readonly string[] =
                kindsOf[animation as keyof typeof kindsOf];
            for (const direction of AVATAR_SHEET_DIRECTIONS) {
                for (const column of frames[direction]) {
                    const slot = AVATAR_SHEET_SLOTS[column];

                    // The sheet only has the emote facing down, so every
                    // direction shows that one.
                    expect(slot.direction).toBe(
                        animation === "EMOTE" ? PLAYER_DIRECTIONS.DOWN : direction
                    );
                    expect(allowed).toContain(slot.kind);
                }
            }
        }
    });

    it("has frames and a rate for the same animations", () => {
        expect(Object.keys(AVATAR_FRAMES).sort()).toEqual(
            Object.keys(AVATAR_ANIMATIONS).sort()
        );
    });

    it("never gives one frame to two directions of the same animation", () => {
        for (const [animation, frames] of Object.entries(AVATAR_FRAMES)) {
            // The emote is the one animation the directions share.
            if (animation === "EMOTE") continue;

            const columns = AVATAR_SHEET_DIRECTIONS.flatMap(
                (direction) => frames[direction]
            );

            expect(new Set(columns).size).toBe(columns.length);
        }
    });

    it("keeps the anchor inside the frame", () => {
        expect(AVATAR.anchor.x).toBeLessThan(AVATAR.frame.w);
        expect(AVATAR.anchor.y).toBeLessThan(AVATAR.frame.h);
    });
});

describe("slot orders", () => {
    it("draws every slot but the costume", () => {
        const drawn = AVATAR_SLOT_VALUES.filter((slot) => slot !== "COSTUME");
        expect(new Set(AVATAR_SLOT_ORDER)).toEqual(new Set(drawn));
        expect(AVATAR_SLOT_ORDER).toHaveLength(drawn.length);
    });

    it("lists every slot once in the tabs", () => {
        expect(AVATAR_SLOT_TABS).toHaveLength(11);
        expect(new Set(AVATAR_SLOT_TABS)).toEqual(new Set(AVATAR_SLOT_VALUES));
    });
});

describe("color", () => {
    it("accepts only upper case #RRGGBB", () => {
        expect(AVATAR_COLOR_PATTERN.test("#F03827")).toBe(true);
        expect(AVATAR_COLOR_PATTERN.test("#f03827")).toBe(false);
        expect(AVATAR_COLOR_PATTERN.test("F03827")).toBe(false);
        expect(AVATAR_COLOR_PATTERN.test("#F0382")).toBe(false);
    });
});

describe("limits", () => {
    it("has a chance from 0 to 1 per slot", () => {
        for (const slot of AVATAR_SLOT_VALUES) {
            expect(AVATAR_RANDOM_CHANCE[slot]).toBeGreaterThanOrEqual(0);
            expect(AVATAR_RANDOM_CHANCE[slot]).toBeLessThanOrEqual(1);
        }
    });

    it("has a default page size inside the maximum", () => {
        expect(AVATAR_PARTS_PAGE.default).toBeGreaterThan(0);
        expect(AVATAR_PARTS_PAGE.default).toBeLessThanOrEqual(
            AVATAR_PARTS_PAGE.max
        );
    });
});
