import type { PartMannequin } from "../../../hooks/admin/usePartMannequin";
import { MannequinStage } from "../../views/admin/MannequinStage";

type Props = {
    // What `usePartMannequin` answers. The page keeps it to read `composed`
    // and the problem of the sheet for its own form.
    mannequin: PartMannequin;
};

// The live preview of the pages that create a part or a color: the mannequin
// with the sheet the person chose on it, and a note when it is a body that
// stands in for a mannequin that is not registered.
export const PartMannequinPreview = ({ mannequin }: Props) => (
    <div className="flex flex-col gap-3">
        <MannequinStage mannequin={mannequin} />
    </div>
);
