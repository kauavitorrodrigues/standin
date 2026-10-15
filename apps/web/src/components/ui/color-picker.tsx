import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { ASSET_COLOR_HEX_PATTERN } from "@standin/contracts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

type ColorPickerProps = {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
    name?: string;
};

export function ColorPicker({
    value,
    onChange,
    disabled,
    className,
    name,
}: ColorPickerProps) {
    const [open, setOpen] = useState(false);
    const parsedValue = ASSET_COLOR_HEX_PATTERN.test(value) ? value : "#000000";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        name={name}
                        variant="outline"
                        size="icon"
                        disabled={disabled}
                        className={cn(
                            "size-8 shrink-0 self-start rounded-full p-0",
                            className
                        )}
                        style={{ backgroundColor: parsedValue }}
                    >
                        <span className="sr-only">Selecionar cor</span>
                    </Button>
                }
            />
            <PopoverContent
                align="end"
                className="flex w-56 flex-col gap-3 p-3"
            >
                <HexColorPicker
                    color={parsedValue}
                    onChange={onChange}
                    className="!w-full"
                />
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    maxLength={7}
                    className="w-full"
                />
            </PopoverContent>
        </Popover>
    );
}
