import type { DecoratorFocus } from "@/features/decorator/types/decorator-focus";

// What the page offers to the tasks, and what they need to know.
export type TaskActionContext = {
    canDecorate: boolean;
    // The desk of the person, when they have one.
    ownDeskId: string | undefined;
    openAvatarEditor: () => void;
    startDeskGuide: () => void;
    openDecorator: (focus: DecoratorFocus) => void;
};
