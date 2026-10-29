export type BuildInfo = {
    version: string;
    // Short hash of the commit, empty when the build had no way to know it.
    commit: string;
    // ISO date of that commit, empty when unknown.
    commitTime: string;
};

// The constants only exist in a build made by vite.config.ts. Tests and tools
// that load the code another way get an empty, harmless value.
const read = (value: () => string): string => {
    try {
        return value();
    } catch {
        return "";
    }
};

export const BUILD_INFO: BuildInfo = {
    version: read(() => __APP_VERSION__),
    commit: read(() => __APP_COMMIT__),
    commitTime: read(() => __APP_COMMIT_TIME__),
};

// One short line for the footer of the settings: "v0.0.0 · 644e6af".
export const formatBuildInfo = (info: BuildInfo = BUILD_INFO): string => {
    const parts = [info.version && `v${info.version}`, info.commit].filter(
        Boolean
    );
    return parts.length > 0 ? parts.join(" · ") : "versão desconhecida";
};

let logged = false;

// Prints the build once when the app starts, for whoever reads a bug report.
export const logBuildInfo = (info: BuildInfo = BUILD_INFO): void => {
    if (logged) return;
    logged = true;
    const when = info.commitTime ? ` (${info.commitTime})` : "";
    console.info(`[standin] ${formatBuildInfo(info)}${when}`);
};
