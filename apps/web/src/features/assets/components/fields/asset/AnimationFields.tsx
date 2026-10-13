import {
    useWatch,
    type Control,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";
import { NumberFormField } from "@/components/fields/NumberFormField";
import { SwitchFormField } from "@/components/fields/SwitchFormField";
import { FrameCountField } from "./FrameCountField";
import { RepeatCountField } from "./RepeatCountField";

type WithAnimation = FieldValues & {
    frameCount?: number | undefined;
    frameDurationMs: number | undefined;
    loopForever: boolean;
    repeatCount: number | undefined;
};

type Props<T extends WithAnimation> = {
    control: Control<T>;
    // The frame count is chosen once, when the asset is created.
    showFrameCount: boolean;
    disabled?: boolean;
};

// How an animated asset plays: the number of frames of the strip, how long
// each one stays and how many times it repeats.
export function AnimationFields<T extends WithAnimation>({
    control,
    showFrameCount,
    disabled,
}: Props<T>) {
    const loopForever = useWatch({
        control,
        name: "loopForever" as FieldPath<T>,
    });

    return (
        <div className="flex flex-col gap-3">
            <div
                className={`grid items-start gap-2 ${showFrameCount ? "grid-cols-[1fr_1fr_auto]" : "grid-cols-[1fr_auto]"}`}
            >
                <FrameCountField
                    control={control}
                    show={showFrameCount}
                    disabled={disabled}
                />
                <NumberFormField
                    control={control}
                    name={"frameDurationMs" as FieldPath<T>}
                    label="Duração (ms)"
                    hint="Quanto tempo cada frame fica na tela. É igual para todos os frames."
                    required
                    min={1}
                    disabled={disabled}
                />
                <SwitchFormField
                    control={control}
                    name={"loopForever" as FieldPath<T>}
                    label="Loop"
                    size="lg"
                    hint="Repetir sempre. Ligado: a animação roda em loop infinito. Desligado: ela repete só a quantidade de vezes informada."
                    disabled={disabled}
                />
            </div>
            <RepeatCountField
                control={control}
                loopForever={loopForever}
                disabled={disabled}
            />
        </div>
    );
}
