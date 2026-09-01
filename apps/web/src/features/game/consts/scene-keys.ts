export const GAME_SCENE_KEYS = {
    MAP: "map-scene",
} as const;

// Emitted once from MapScene.create() on `game.events` - `game.scene.add(...,
// true)` boots the scene asynchronously, so code outside Phaser (e.g.
// useSpaceConnection) can't assume the scene already exists just because the
// `Phaser.Game` instance itself does. `game.events` exists synchronously on
// that instance, so listening for this is race-free regardless of when the
// scene finishes booting relative to the listener being attached.
export const SCENE_EVENTS = {
    MAP_READY: "map-scene:ready",
} as const;
