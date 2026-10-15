import { EditorLoadingState } from "@/features/editor/components/views/EditorLoadingState";
import { useComposerStart } from "../../hooks/useComposerStart";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";
import { AreaErrorState } from "../views/AreaErrorState";
import { AreaSession } from "./AreaSession";

type Props = {
    areaId?: string;
    // The fields a new area starts with.
    values?: AreaComposerFormValues;
};

// Waits for the library and the area, then opens the session.
export const AreaStage = ({ areaId, values }: Props) => {
    const { start, palette, isError } = useComposerStart(areaId, values);

    if (isError) return <AreaErrorState />;
    if (!start) return <EditorLoadingState />;

    return <AreaSession areaId={areaId} start={start} palette={palette} />;
};
