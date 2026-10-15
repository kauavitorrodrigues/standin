import { DecoratorRoot } from "@/features/decorator/components/instances/DecoratorRoot";
import type { useDecoratorSession } from "@/features/decorator/hooks/useDecoratorSession";
import type { GameEngineHandle } from "@/features/game/types/game";

type DecoratorProps = {
    session: ReturnType<typeof useDecoratorSession>;
    handle: GameEngineHandle | null;
    mapId: string;
};

// The decorator of the space, mounted over the game. It exists only while the
// session is open, so nothing of it runs the rest of the time.
export const Decorator = ({ session, handle, mapId }: DecoratorProps) => {
    if (!session.isOpen) return null;

    return (
        <DecoratorRoot
            handle={handle}
            mapId={mapId}
            focus={session.focus}
            onClose={session.close}
        />
    );
};
