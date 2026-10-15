import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { DraftStoreProvider } from "@/features/editor/components/instances/DraftStoreProvider";
import type { ComposerStart } from "../../types/composerStart";
import type { AreaPalette } from "../../types/areaPalette";
import { buildAreaMapData } from "../../utils/buildAreaMapData";
import { AreaWorkspace } from "./AreaWorkspace";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";

type Props = {
    areaId?: string;
    start: ComposerStart;
    palette: AreaPalette;
};

// What the composer opened with is kept as it was, so a library that refreshes
// in the background does not rebuild the canvas under the user.
export const AreaSession = ({ areaId, start, palette }: Props) => {
    const { paths } = useLibraryScope();
    const [opened] = useState(start);
    const map = useMemo(() => buildAreaMapData(opened.model), [opened]);
    const navigate = useNavigate();

    return (
        <DraftStoreProvider model={opened.model}>
            <AreaWorkspace
                areaId={areaId}
                map={map}
                start={opened}
                palette={palette}
                onExit={() => navigate({ to: paths.areas })}
            />
        </DraftStoreProvider>
    );
};
