import { EditorStoreProvider } from "@/features/editor/components/instances/EditorStoreProvider";
import { SmallScreenNotice } from "@/features/editor/components/views/SmallScreenNotice";
import { useIsSmallScreen } from "@/features/editor/hooks/useIsSmallScreen";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";
import { AreaStage } from "../instances/AreaStage";

type Props = {
    // The area to edit. Without it the composer opens on a blank canvas.
    areaId?: string;
    // The fields a new area starts with, asked before the composer.
    values?: AreaComposerFormValues;
};

// The composer of areas: the editor of maps on a blank canvas, with no lock,
// no saved draft and no publish. The key gives each area its own store.
export function AreaEditorPage({ areaId, values }: Props) {
    const isSmallScreen = useIsSmallScreen();

    if (isSmallScreen) return <SmallScreenNotice />;

    return (
        <EditorStoreProvider key={areaId ?? "new"}>
            <AreaStage areaId={areaId} values={values} />
        </EditorStoreProvider>
    );
}
