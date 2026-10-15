import type Phaser from "phaser";
import { DecoratorMode } from "@/features/game/lib/DecoratorMode";
import type { DecoratorModeOptions } from "@/features/game/types/decorator";
import { getMapScene } from "@/features/game/utils/map";

// Turns the scene of the map into the decorator and gives the way to turn it
// off. A scene that is not created yet has nothing to decorate, so it gives
// null.
export const startDecorator = (
    game: Phaser.Game,
    options: DecoratorModeOptions
): (() => void) | null => {
    const scene = getMapScene(game);
    if (!scene?.isReady()) return null;

    const mode = new DecoratorMode(scene, options);
    return () => mode.destroy();
};
