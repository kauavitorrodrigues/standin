import { EditorForbiddenState } from "@/features/maps/__shared__/components/views/EditorForbiddenState";
import { LockDeniedDialog } from "@/features/maps/__shared__/components/dialogs/LockDeniedDialog";
import type { LockStatus } from "@/features/editor/types/lock-status";
import { getLockDeniedDescription } from "@/features/maps/__shared__/utils/getLockDeniedDescription";

type DeniedLock = Extract<LockStatus, { code: string }>;

type EditorLockDeniedStateProps = {
    lock: DeniedLock;
    onExit: () => void;
};

// The lock was refused. A refusal for lack of permission has its own state,
// and the other one (someone else is editing) is the dialog.
export const EditorLockDeniedState = ({
    lock,
    onExit,
}: EditorLockDeniedStateProps) => {
    switch (lock.code) {
        case "FORBIDDEN":
            return <EditorForbiddenState onExit={onExit} />;
        case "MAP_LOCKED":
            return (
                <LockDeniedDialog
                    description={getLockDeniedDescription(lock.by, lock.since)}
                    onExit={onExit}
                />
            );
    }
};
