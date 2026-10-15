import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WALL_STYLE_NAME_MAX } from "@standin/contracts";

type Values = { style: string };

type Props = {
    // The style of the only selected wall, or empty.
    style: string;
    disabled: boolean;
    onCommit: (style: string) => void;
};

// The name of the style the wall belongs to. It is sent when the field loses
// focus, so a name being typed is not cut into styles of one letter.
export const WallStyleField = ({ style, disabled, onCommit }: Props) => {
    const form = useForm<Values>({ values: { style } });
    const register = form.register("style", {
        onBlur: (event) => onCommit(event.target.value),
    });

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor="wall-style">Estilo</Label>
            <Input
                id="wall-style"
                placeholder="Tijolo, Vidro, Madeira"
                maxLength={WALL_STYLE_NAME_MAX}
                disabled={disabled}
                autoComplete="off"
                {...register}
            />
        </div>
    );
};
