import { useDisconnect } from "./disconnect";
import { useRemoveApp } from "./removeApp";
import { useRemovePerson } from "./removePerson";
import { useSaveApp } from "./saveApp";

export const SpotifyMutations = {
    saveApp: useSaveApp,
    removeApp: useRemoveApp,
    removePerson: useRemovePerson,
    disconnect: useDisconnect,
};
