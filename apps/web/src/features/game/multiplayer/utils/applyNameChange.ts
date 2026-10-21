import type { NameChangedPayload } from "@standin/contracts";

type Params = {
    change: NameChangedPayload;
    selfUserId: string;
    // The running scene, or null while there is none.
    scene: { setUserName: (userId: string, name: string) => void } | null;
    // Puts the new name of the signed in person where the app reads it from.
    // The tag over the local avatar follows that (see useLocalUserProfile).
    updateOwnName: (name: string) => void;
};

// Someone in the room was renamed. The tag over their avatar changes in the
// running scene. The tag over the local avatar is not in the scene's hands: it
// follows the name of the signed in person, so a rename made in another tab
// reaches it through the app's own copy of that name.
export const applyNameChange = ({
    change,
    selfUserId,
    scene,
    updateOwnName,
}: Params): void => {
    if (change.userId === selfUserId) {
        updateOwnName(change.name);
        return;
    }

    scene?.setUserName(change.userId, change.name);
};
