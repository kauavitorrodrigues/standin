import { useMemo, useState } from "react";
import { buildRoomWallOps, type Zone } from "@standin/contracts";
import { useDraftSelector } from "@/features/editor/hooks/useDraftSelector";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { describeWallIssue } from "@/features/editor/utils/describeWallIssue";
import {
    getRoomWallStyles,
    resolveRoomWallStyle,
} from "@/features/editor/utils/getRoomWallStyles";

// What the walls section of the room panel does for one room: the styles the
// library offers and the draw of the outline of the room, as one step of the
// history.
export const useRoomWalls = (room: Zone, chosenStyle: string | undefined) => {
    const draftStore = useDraftStore();
    const library = useDraftSelector((state) => state.draft.library);
    const [notice, setNotice] = useState<string | null>(null);

    const styles = useMemo(() => getRoomWallStyles({ library }), [library]);
    const style = resolveRoomWallStyle(styles, chosenStyle);

    const drawWalls = () => {
        if (style === null) return;

        const built = buildRoomWallOps(room, style.tilesetId, style.tileIndex);
        if (!built.ok) {
            setNotice(describeWallIssue(built.errors[0].code));
            return;
        }

        const result = draftStore.dispatchGesture(built.ops);
        setNotice(
            result.ok ? null : describeWallIssue(result.errors[0]?.code ?? "")
        );
    };

    return { styles, notice, canDraw: style !== null, drawWalls };
};
