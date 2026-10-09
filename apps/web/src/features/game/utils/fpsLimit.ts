import type Phaser from "phaser";

type LimitableLoop = Phaser.Core.TimeStep & { _limitRate: number };

// Phaser reads the limit once, from the game config. This also changes it
// while the game runs, so a change in the settings needs no restart. The
// rate in milliseconds is a private field of the loop, kept in step with the
// public ones here. 0 removes the limit.
export const applyFpsLimit = (game: Phaser.Game, limit: number): void => {
    const loop = game.loop as LimitableLoop;
    loop.fpsLimit = limit;
    loop.hasFpsLimit = limit > 0;
    loop._limitRate = limit > 0 ? 1000 / limit : 0;
};
