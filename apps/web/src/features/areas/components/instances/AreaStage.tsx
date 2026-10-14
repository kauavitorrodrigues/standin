import { EditorLoadingState } from "@/features/editor/components/views/EditorLoadingState";
import { useComposerStart } from "../../hooks/useComposerStart";
import { AreaErrorState } from "../views/AreaErrorState";
import { AreaSession } from "./AreaSession";

type Props = { areaId?: string };

// Waits for the library and the area, then opens the session.
export const AreaStage = ({ areaId }: Props) => {
    const { start, palette, isError } = useComposerStart(areaId);

    if (isError) return <AreaErrorState />;
    if (!start) return <EditorLoadingState />;

    return <AreaSession areaId={areaId} start={start} palette={palette} />;
};
