import type { ReactNode } from "react";
import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";

type Props<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = {
    control: Control<TFieldValues>;
    name: TName;
    icon: LucideIcon;
    title: string;
    description: string;
    disabled?: boolean;
    // The properties that only make sense while the switch is on. They show
    // inside the card, under it.
    children?: ReactNode;
};

// A setting that is a switch with a name and a sentence about it, in a card.
// What depends on it opens inside the card while it is on, under a line that
// only exists while it is open.
export function SwitchCardField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    control,
    name,
    icon: Icon,
    title,
    description,
    disabled,
    children,
}: Props<TFieldValues, TName>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <div className="bg-card flex flex-col rounded-xl border p-4">
                    <div className="flex items-start gap-3">
                        <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
                            <Icon className="size-4" />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <label
                                htmlFor={name}
                                className="text-sm leading-snug font-medium"
                            >
                                {title}
                            </label>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                {description}
                            </p>
                        </div>
                        <Switch
                            id={name}
                            checked={Boolean(field.value)}
                            disabled={disabled}
                            onCheckedChange={field.onChange}
                        />
                    </div>
                    <SwitchCardBody open={Boolean(field.value)}>
                        {children}
                    </SwitchCardBody>
                </div>
            )}
        />
    );
}

// What depends on the switch, opening and closing under the header with the
// height of the content. The line that separates it only exists inside it, so
// it goes with it.
const SwitchCardBody = ({
    open,
    children,
}: {
    open: boolean;
    children?: ReactNode;
}) => {
    if (!children) return null;

    return (
        <Collapsible open={open}>
            <CollapsibleContent>
                <div className="mt-4 border-t pt-4">{children}</div>
            </CollapsibleContent>
        </Collapsible>
    );
};
