import { AlertCircle, Loader2 } from "lucide-react";
import type { PartMannequin } from "../../../hooks/admin/usePartMannequin";
import { getMannequinState } from "../../../utils/admin/getMannequinState";
import { AvatarPreviewCanvas } from "../../instances/AvatarPreviewCanvas";
import { MannequinNoBase } from "./MannequinNoBase";

type Props = { mannequin: PartMannequin };

// The blank avatar with the part on it, or what stands in its place: the
// blank alone while there is no front sheet, a spinner while it is read, the
// problem of the file when it cannot be used. The avatar turns when clicked.
export const MannequinStage = ({ mannequin }: Props) => {
    const state = getMannequinState({
        layers: mannequin.layers,
        hasFront: mannequin.frontPixels !== null,
        frontIssue: mannequin.frontIssue,
        isLoading: mannequin.isLoading,
    });

    switch (state.kind) {
        case "issue":
            return (
                <p
                    role="alert"
                    className="text-destructive flex min-h-64 items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-sm"
                >
                    <AlertCircle className="size-4 shrink-0" />
                    {state.message}
                </p>
            );
        case "loading":
            return (
                <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            );
        case "empty":
            return (
                <div className="flex flex-col gap-3">
                    <AvatarPreviewCanvas
                        layers={state.layers}
                        className="mx-auto w-full max-w-sm"
                    />
                    <MannequinNoBase mannequin={mannequin} />
                    <p className="text-muted-foreground text-center text-sm">
                        Escolha o PNG da frente para ver a peça no manequim.
                    </p>
                </div>
            );
        case "ready":
            return (
                <AvatarPreviewCanvas
                    layers={state.layers}
                    className="mx-auto w-full max-w-sm"
                />
            );
    }
};
