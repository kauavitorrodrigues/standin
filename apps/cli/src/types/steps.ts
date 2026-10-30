import type { STEP_ACTIONS, STEP_TARGETS } from "../consts/steps";

export type StepTarget = (typeof STEP_TARGETS)[keyof typeof STEP_TARGETS];

export type StepAction = (typeof STEP_ACTIONS)[keyof typeof STEP_ACTIONS];

// A step of a run: the library, or a template by its name. A template can be
// called `library`, so the target tells them apart.
export type StepRef = {
    target: StepTarget;
    name: string;
};

// One thing a command that writes in steps has already done.
export type CompletedStep = StepRef & {
    action: StepAction;
    // The id of the template, when the step has one.
    id?: string;
};

// A template that was created by this run but whose steps did not all finish.
export type UnfinishedTemplate = {
    name: string;
    id: string;
};

// What a run has done so far; it is what a failure reports.
export type StepsProgress = {
    done: CompletedStep[];
    // What the run still has to do; it is not set when the command has a
    // fixed list of steps. The step that failed is still in it.
    pending?: StepRef[];
    unfinished?: UnfinishedTemplate;
    // The step whose write is on its way. If the connection fails while it
    // is set, the write may or may not have happened.
    writing?: StepRef;
};
