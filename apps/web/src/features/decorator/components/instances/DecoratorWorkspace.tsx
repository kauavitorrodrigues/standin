import { useCallback } from "react";
import { EDIT_SCOPES, TILE_SIZE } from "@standin/contracts";
import type { Cell } from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { DECORATOR_FOCUS_OFFSET_X_PX } from "@/features/game/consts/decorator";
import type { GameEngineHandle } from "@/features/game/types/game";
import { DECORATOR_FOCUS_KINDS } from "@/features/decorator/consts/focus-kinds";
import { DecoratorDeskRemovalDialog } from "@/features/decorator/components/instances/DecoratorDeskRemovalDialog";
import { DecoratorDiscardDialog } from "@/features/decorator/components/instances/DecoratorDiscardDialog";
import { DecoratorFailureDialog } from "@/features/decorator/components/instances/DecoratorFailureDialog";
import { DecoratorLockNotice } from "@/features/decorator/components/instances/DecoratorLockNotice";
import { DecoratorPanel } from "@/features/decorator/components/instances/DecoratorPanel";
import { DecoratorResumeDialog } from "@/features/decorator/components/instances/DecoratorResumeDialog";
import { HintLine } from "@/features/decorator/components/views/HintLine";
import { useApplyDecoration } from "@/features/decorator/hooks/useApplyDecoration";
import { useCloseDecorator } from "@/features/decorator/hooks/useCloseDecorator";
import { useDecoratorEngine } from "@/features/decorator/hooks/useDecoratorEngine";
import { useDecoratorHotkeys } from "@/features/decorator/hooks/useDecoratorHotkeys";
import { useResumeDecoration } from "@/features/decorator/hooks/useResumeDecoration";
import type { DecoratorFocus } from "@/features/decorator/types/decorator-focus";
import { ObjectToolbar } from "@/features/editor/components/instances/ObjectToolbar";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useDraftPersistence } from "@/features/maps/__shared__/hooks/useDraftPersistence";

type DecoratorWorkspaceProps = {
    handle: GameEngineHandle | null;
    mapId: string;
    focus: DecoratorFocus;
    onClose: () => void;
};

const getFocusId = ({ kind, id }: DecoratorFocus): string | null => {
    switch (kind) {
        case DECORATOR_FOCUS_KINDS.OBJECT:
        case DECORATOR_FOCUS_KINDS.DESK:
            return id ?? null;
        case DECORATOR_FOCUS_KINDS.NONE:
            return null;
    }
};

// The decorator with its model loaded: the scene turned into the decorator,
// the panel, the bar over the selected object and the dialogs. Closing applies
// the draft once, and a failure keeps the decorator open with the dialog.
export const DecoratorWorkspace = ({
    handle,
    mapId,
    focus,
    onClose,
}: DecoratorWorkspaceProps) => {
    const { user } = useAuth();
    const draftStore = useDraftStore();
    const { toolbarRef, hintRef } = useDecoratorEngine(
        handle,
        getFocusId(focus)
    );
    useDecoratorHotkeys();

    const resume = useResumeDecoration();
    // Writes the draft to IndexedDB, but only after the person answered the
    // resume question, so a saved decoration is never overwritten before that.
    useDraftPersistence(
        draftStore,
        user.id,
        mapId,
        resume.settled,
        EDIT_SCOPES.OBJECTS
    );

    const apply = useApplyDecoration(onClose);
    const close = useCloseDecorator(apply, onClose);

    const focusCell = useCallback(
        ([column, row]: Cell) =>
            handle?.focusPoint(
                (column + 0.5) * TILE_SIZE,
                (row + 0.5) * TILE_SIZE,
                DECORATOR_FOCUS_OFFSET_X_PX
            ),
        [handle]
    );

    return (
        <>
            <DecoratorPanel mapId={mapId} onClose={close} />
            <ObjectToolbar toolbarRef={toolbarRef} />
            <HintLine ref={hintRef} />
            <DecoratorLockNotice />
            <DecoratorResumeDialog
                resume={resume.resume}
                onResume={resume.replay}
                onDiscard={resume.discard}
            />
            <DecoratorDeskRemovalDialog />
            <DecoratorDiscardDialog />
            <DecoratorFailureDialog onRetry={apply} onFocusCell={focusCell} />
        </>
    );
};
