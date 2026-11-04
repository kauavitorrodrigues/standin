import { describe, expect, it, vi } from "vitest";
import { ONBOARDING_TASKS } from "@standin/contracts";
import { DECORATOR_FOCUS_KINDS } from "@/features/decorator/consts/focus-kinds";
import { buildTaskActions } from "../buildTaskActions";

const KEY = ONBOARDING_TASKS.CUSTOMIZE_OFFICE;

describe("buildTaskActions", () => {
    it("opens the decorator on the own desk", () => {
        const openDecorator = vi.fn();
        const actions = buildTaskActions({
            canDecorate: true,
            ownDeskId: "desk-1",
            startDeskGuide: vi.fn(),
            openAvatarEditor: vi.fn(),
            openDecorator,
        });
        actions[KEY]?.();
        expect(openDecorator).toHaveBeenCalledWith({
            kind: DECORATOR_FOCUS_KINDS.DESK,
            id: "desk-1",
        });
    });

    it("opens the decorator on nothing when there is no desk", () => {
        const openDecorator = vi.fn();
        const actions = buildTaskActions({
            canDecorate: true,
            ownDeskId: undefined,
            startDeskGuide: vi.fn(),
            openAvatarEditor: vi.fn(),
            openDecorator,
        });
        actions[KEY]?.();
        expect(openDecorator).toHaveBeenCalledWith({
            kind: DECORATOR_FOCUS_KINDS.NONE,
        });
    });

    it("offers nothing when the person cannot decorate", () => {
        const actions = buildTaskActions({
            canDecorate: false,
            ownDeskId: "desk-1",
            startDeskGuide: vi.fn(),
            openAvatarEditor: vi.fn(),
            openDecorator: vi.fn(),
        });
        expect(actions[KEY]).toBeUndefined();
    });

    it("opens the avatar editor for the avatar task", () => {
        const openAvatarEditor = vi.fn();
        const actions = buildTaskActions({
            canDecorate: false,
            ownDeskId: undefined,
            startDeskGuide: vi.fn(),
            openAvatarEditor,
            openDecorator: vi.fn(),
        });
        expect(actions[ONBOARDING_TASKS.PERSONALIZE_AVATAR]).toBe(
            openAvatarEditor
        );
    });

    it("starts the desk guide for the desk task", () => {
        const startDeskGuide = vi.fn();
        const actions = buildTaskActions({
            canDecorate: false,
            ownDeskId: undefined,
            startDeskGuide,
            openAvatarEditor: vi.fn(),
            openDecorator: vi.fn(),
        });
        expect(actions[ONBOARDING_TASKS.CLAIM_DESK]).toBe(startDeskGuide);
    });
});
