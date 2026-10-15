import { useContext } from "react";
import { LockLostNotice } from "@/features/decorator/components/views/LockLostNotice";
import { LockLostReasonContext } from "@/features/decorator/contexts/LockLostReasonContext";
import { useDecoratorLockRecovery } from "@/features/decorator/hooks/useDecoratorLockRecovery";
import { getLockNoticeText } from "@/features/decorator/utils/getLockNoticeText";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";

// Tells that the decorator is read only while the lock is lost, and offers to
// get it back.
export const DecoratorLockNotice = () => {
    const lost = useEditorSelector(
        (state) => state.lockStatus === LOCK_STATUS.LOST
    );
    const reason = useContext(LockLostReasonContext);
    const { recover, isRecovering } = useDecoratorLockRecovery();

    if (!lost) return null;

    return (
        <LockLostNotice
            text={getLockNoticeText(reason)}
            isRecovering={isRecovering}
            onRecover={recover}
        />
    );
};
