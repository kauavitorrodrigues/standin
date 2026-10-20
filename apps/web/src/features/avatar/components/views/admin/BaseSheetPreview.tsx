import { AlertCircle, Loader2 } from "lucide-react";
import type { AvatarLayer } from "@standin/contracts";
import { getMannequinState } from "../../../utils/admin/getMannequinState";
import { AvatarPreviewCanvas } from "../../instances/AvatarPreviewCanvas";

type Props = {
    layers: AvatarLayer[];
    issue: string | null;
    isLoading: boolean;
};

// The sprite of a new base or mannequin on the scene of the preview, or what
// stands in its place: a note while there is no sprite, a spinner while it is
// read, the problem of the file when it cannot be used. It carries no name
// tag: a base or a mannequin is not a person.
export const BaseSheetPreview = ({ layers, issue, isLoading }: Props) => {
    const state = getMannequinState({
        layers,
        hasFront: layers.length > 0,
        frontIssue: issue,
        isLoading,
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
                    <p className="text-muted-foreground text-center text-sm">
                        Escolha o PNG do sprite para ver o avatar.
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
