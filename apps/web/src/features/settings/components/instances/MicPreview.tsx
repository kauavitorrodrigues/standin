import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMicPreview } from "@/features/media-devices/hooks/useMicPreview";
import { getMicPreviewCaption } from "../../utils/getMicPreviewCaption";
import { SettingsRow } from "../layout/SettingsRow";
import { LiveWaveform } from "@/components/ui/live-waveform";

// Takes no space until the test starts: the meter only exists while it runs.
export const MicPreview = () => {
    const {
        stream,
        error,
        isPreviewing,
        isListening,
        setIsListening,
        start,
        stop,
    } = useMicPreview();

    const caption = getMicPreviewCaption(error, !!stream, isListening);

    const panel = isPreviewing ? (
        <>
            <div className="flex flex-col gap-1.5">
                <LiveWaveform
                    mediaStream={stream}
                    active={!!stream}
                    height={48}
                    aria-label="Nível do microfone"
                    className="rounded-lg bg-muted"
                />
                <span
                    className={
                        caption.isError
                            ? "text-xs text-destructive"
                            : "text-xs text-muted-foreground"
                    }
                >
                    {caption.text}
                </span>
            </div>
            <SettingsRow
                title="Ouvir minha voz"
                description="Use fones de ouvido para evitar eco"
            >
                <Switch
                    aria-label="Ouvir minha voz"
                    checked={isListening}
                    onCheckedChange={setIsListening}
                />
            </SettingsRow>
        </>
    ) : null;

    return (
        <>
            <SettingsRow
                title="Testar microfone"
                description="Fale algo para ver o nível e ouvir a sua própria voz"
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={isPreviewing ? stop : start}
                >
                    {isPreviewing ? "Parar teste" : "Iniciar teste"}
                </Button>
            </SettingsRow>
            {panel}
        </>
    );
};
