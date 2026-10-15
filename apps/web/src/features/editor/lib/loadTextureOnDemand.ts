import Phaser from "phaser";

/**
 * Runs `enqueue` to add one file to the scene loader and starts the loader
 * after the scene is already running. Resolves with true when the texture
 * `key` exists once its file settled, and false when the file failed or the
 * scene went away. It never rejects, so the caller only chooses a fallback.
 */
export const loadTextureOnDemand = (
    scene: Phaser.Scene,
    key: string,
    enqueue: (loader: Phaser.Loader.LoaderPlugin) => void
): Promise<boolean> => {
    if (scene.textures.exists(key)) return Promise.resolve(true);

    return new Promise<boolean>((resolve) => {
        const { load } = scene;

        const settle = (loaded: boolean) => {
            load.off(Phaser.Loader.Events.FILE_COMPLETE, handleComplete);
            load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, handleError);
            scene.events.off(Phaser.Scenes.Events.SHUTDOWN, handleShutdown);
            resolve(loaded);
        };
        const handleComplete = (fileKey: string) => {
            if (fileKey === key) settle(scene.textures.exists(key));
        };
        const handleError = (file: Phaser.Loader.File) => {
            if (file.key === key) settle(false);
        };
        const handleShutdown = () => settle(false);

        load.on(Phaser.Loader.Events.FILE_COMPLETE, handleComplete);
        load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, handleError);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, handleShutdown);

        enqueue(load);
        // A file added while the loader runs joins the same run.
        if (!load.isLoading()) load.start();
    });
};
