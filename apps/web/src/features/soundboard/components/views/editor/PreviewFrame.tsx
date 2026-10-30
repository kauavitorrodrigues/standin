import type { ReactNode } from "react";

type Props = { children: ReactNode };

// The container of the preview: the controls on the left, the waveform with
// its handles taking the rest.
export const PreviewFrame = ({ children }: Props) => (
    <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Prévia</p>
        <div className="flex items-center gap-3 rounded-md bg-muted p-2">
            {children}
        </div>
    </div>
);
