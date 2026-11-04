import { describe, expect, it } from "vitest";
import { ONBOARDING_TASKS } from "@standin/contracts";
import {
    ONBOARDING_FLOW_ACTIONS,
    ONBOARDING_FLOW_KINDS,
} from "../../consts/flow";
import { INITIAL_FLOW_STATE, flowReducer } from "../flowReducer";

const checklist = { kind: ONBOARDING_FLOW_KINDS.CHECKLIST } as const;
const task = {
    kind: ONBOARDING_FLOW_KINDS.TASK,
    taskKey: ONBOARDING_TASKS.CLAIM_DESK,
} as const;

describe("flowReducer", () => {
    it("starts with no flow", () => {
        expect(INITIAL_FLOW_STATE.active).toBeNull();
    });

    it("opens a flow", () => {
        const state = flowReducer(INITIAL_FLOW_STATE, {
            type: ONBOARDING_FLOW_ACTIONS.OPEN,
            flow: checklist,
        });
        expect(state.active).toEqual(checklist);
    });

    it("keeps one flow: opening another replaces the first", () => {
        const first = flowReducer(INITIAL_FLOW_STATE, {
            type: ONBOARDING_FLOW_ACTIONS.OPEN,
            flow: checklist,
        });
        const second = flowReducer(first, {
            type: ONBOARDING_FLOW_ACTIONS.OPEN,
            flow: task,
        });
        expect(second.active).toEqual(task);
    });

    it("closes the flow", () => {
        const open = { active: task };
        const state = flowReducer(open, {
            type: ONBOARDING_FLOW_ACTIONS.CLOSE,
        });
        expect(state.active).toBeNull();
    });

    it("returns the same state when closing with nothing open", () => {
        const state = flowReducer(INITIAL_FLOW_STATE, {
            type: ONBOARDING_FLOW_ACTIONS.CLOSE,
        });
        expect(state).toBe(INITIAL_FLOW_STATE);
    });
});
