import type { ReactNode } from "react";
import { PanelNotice } from "@/features/decorator/components/views/PanelNotice";
import { PanelOpening } from "@/features/decorator/components/views/PanelOpening";
import { useFreshEditorModel } from "@/features/decorator/hooks/useFreshEditorModel";
import { DraftStoreProvider } from "@/features/editor/components/instances/DraftStoreProvider";

type DecoratorModelGateProps = {
    mapId: string;
    onClose: () => void;
    children: ReactNode;
};

// The draft starts from the map as the server has it after the lock was
// granted, never from an older copy the game had cached.
export const DecoratorModelGate = ({
    mapId,
    onClose,
    children,
}: DecoratorModelGateProps) => {
    const { model, isError } = useFreshEditorModel(mapId);

    if (isError) {
        return (
            <PanelNotice
                title="Não foi possível abrir o decorator"
                message="Não conseguimos carregar o space. Tente de novo em instantes."
                onClose={onClose}
            />
        );
    }
    if (!model) return <PanelOpening />;

    return <DraftStoreProvider model={model}>{children}</DraftStoreProvider>;
};
