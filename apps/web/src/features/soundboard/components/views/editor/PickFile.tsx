import { UploadIcon } from "lucide-react";
import { SOUNDBOARD_EXTENSIONS } from "@standin/contracts";
import { cn } from "@/lib/utils";
import { SOUNDBOARD_ACCEPT_MIME } from "../../../consts/upload";
import { useDropFile } from "../../../hooks/useDropFile";

type Props = { onPick: (file: File) => void; disabled: boolean };

const ACCEPT = `${SOUNDBOARD_EXTENSIONS.join(",")},${SOUNDBOARD_ACCEPT_MIME}`;

// The first step: choose the mp3 to cut, by clicking the area or dropping the
// file on it. The input is inside the label, so it opens the picker without a
// ref.
export const PickClipFile = ({ onPick, disabled }: Props) => {
    const drop = useDropFile({ onDrop: onPick, disabled });

    return (
        <label
            {...drop.handlers}
            className={cn(
                "flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-foreground/5 px-4 py-8 text-center text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground has-disabled:pointer-events-none has-disabled:opacity-50 has-focus-visible:ring-2 has-focus-visible:ring-ring",
                drop.isOver && "border-primary bg-primary/10 text-foreground"
            )}
        >
            <UploadIcon className="size-8" />
            <span className="font-medium text-foreground">
                Escolher arquivo mp3
            </span>
            <span>ou arraste e solte aqui</span>
            <input
                type="file"
                className="sr-only"
                accept={ACCEPT}
                disabled={disabled}
                onChange={(event) => {
                    const [file] = event.target.files ?? [];
                    if (file) onPick(file);
                    event.target.value = "";
                }}
            />
        </label>
    );
};
