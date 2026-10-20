import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { PartMannequin } from "../../../hooks/admin/usePartMannequin";
import { MannequinNoBaseText } from "./MannequinNoBaseText";

type Props = { mannequin: PartMannequin };

// A note under the stage when the figure is not a mannequin: a body stands in
// for it, or there is no figure at all. With a mannequin in use, or while the
// bases are still loading, there is nothing to say.
export const MannequinNoBase = ({ mannequin }: Props) => {
    if (mannequin.isBasesPending) return null;
    if (mannequin.previewBaseKind === AVATAR_BASE_KINDS.MANNEQUIN) return null;

    return (
        <p
            role="status"
            className="text-muted-foreground rounded-lg border border-dashed p-3 text-center text-sm"
        >
            <MannequinNoBaseText kind={mannequin.previewBaseKind} />
        </p>
    );
};
