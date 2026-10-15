type ExitChoicesDeps = {
    // Throws the draft away and clears the saved copy.
    discard: () => Promise<void>;
    publishAndExit: () => void;
    onExit: () => void;
    // Closes the dialog.
    close: () => void;
    // The router stopped a navigation. Leaving goes where it was heading.
    blocked: boolean;
    proceedBlocked: () => void;
    stayBlocked: () => void;
    // Lets the next navigation through the unsaved changes guard.
    release: () => void;
};

// What each button of the exit dialog does.
export const createExitChoices = ({
    discard,
    publishAndExit,
    onExit,
    close,
    blocked,
    proceedBlocked,
    stayBlocked,
    release,
}: ExitChoicesDeps) => {
    const leave = () => {
        close();
        if (blocked) {
            proceedBlocked();
            return;
        }
        release();
        onExit();
    };

    return {
        // Starts the publish, which leaves when it succeeds.
        publishAndLeave: () => {
            close();
            publishAndExit();
        },
        // The draft is already in IndexedDB.
        keepAndLeave: leave,
        discardAndLeave: async () => {
            release();
            await discard();
            leave();
        },
        keepEditing: () => {
            close();
            if (blocked) stayBlocked();
        },
    };
};
