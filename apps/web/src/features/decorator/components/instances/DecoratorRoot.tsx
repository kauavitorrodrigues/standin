import { EditorStoreProvider } from "@/features/editor/components/instances/EditorStoreProvider";
import { DecoratorLockGate } from "@/features/decorator/components/instances/DecoratorLockGate";
import { DecoratorModelGate } from "@/features/decorator/components/instances/DecoratorModelGate";
import { DecoratorWorkspace } from "@/features/decorator/components/instances/DecoratorWorkspace";
import type { DecoratorFocus } from "@/features/decorator/types/decorator-focus";
import type { GameEngineHandle } from "@/features/game/types/game";

type DecoratorRootProps = {
    handle: GameEngineHandle | null;
    mapId: string;
    focus: DecoratorFocus;
    onClose: () => void;
};

// The decorator over the game. Each open starts from a clean store: the lock
// of the objects first, then the model, then the workspace.
export const DecoratorRoot = ({
    handle,
    mapId,
    focus,
    onClose,
}: DecoratorRootProps) => (
    <EditorStoreProvider key={mapId}>
        <DecoratorLockGate mapId={mapId} onClose={onClose}>
            <DecoratorModelGate mapId={mapId} onClose={onClose}>
                <DecoratorWorkspace
                    handle={handle}
                    mapId={mapId}
                    focus={focus}
                    onClose={onClose}
                />
            </DecoratorModelGate>
        </DecoratorLockGate>
    </EditorStoreProvider>
);
