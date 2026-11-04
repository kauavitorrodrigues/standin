import { describe, expect, it } from "vitest";
import { ONBOARDING_TASKS } from "@standin/contracts";
import { ONBOARDING_TASK_COPY } from "../../consts/taskCopy";
import { primaryLabelOf, taskText } from "../taskText";

const copy = ONBOARDING_TASK_COPY[ONBOARDING_TASKS.CLAIM_DESK];

describe("taskText", () => {
    it("says what to do while the task is open", () => {
        expect(taskText(copy, false)).toEqual({
            title: copy.title,
            description: copy.description,
        });
    });

    it("changes the text once the task is done", () => {
        expect(taskText(copy, true)).toEqual({
            title: copy.doneTitle,
            description: copy.doneDescription,
        });
    });

    it("names the action of a task that has one", () => {
        expect(primaryLabelOf(copy, true)).toBe(copy.actionLabel);
    });

    it("only says understood for a task without an action", () => {
        expect(primaryLabelOf(copy, false)).toBe("Entendi");
    });
});
