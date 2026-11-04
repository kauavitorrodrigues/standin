// What the checklist and the modal say about one task. The image and the guide
// are optional: a task without them shows only the text.
export type OnboardingTaskCopy = {
    title: string;
    doneTitle: string;
    description: string;
    doneDescription: string;
    imageSrc?: string;
    guideUrl?: string;
    // Label of the primary button when the task has an action in the space.
    actionLabel: string;
};
