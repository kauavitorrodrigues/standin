import type { ReactNode } from "react";
import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import { AnimatedCollapse } from "@/components/ui/animated-collapse";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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
    // False hides the icon, title and switch with a smooth collapse, so only
    // the children show, under a small title. The field value is left as is.
    showHeader?: boolean;
    // Shown in place of the header while it is hidden.
    headerlessTitle?: string;
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
    showHeader = true,
    headerlessTitle,
}: Props<TFieldValues, TName>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <div className="bg-card flex flex-col rounded-xl border p-4">
                    <AnimatedCollapse open={showHeader}>
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
                    </AnimatedCollapse>
                    <HeaderlessTitle
                        open={!showHeader}
                        title={headerlessTitle}
                    />
                    <SwitchCardBody
                        open={Boolean(field.value)}
                        headerOpen={showHeader}
                    >
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
    headerOpen,
    children,
}: {
    open: boolean;
    headerOpen: boolean;
    children?: ReactNode;
}) => {
    if (!children) return null;

    return (
        <Collapsible open={open}>
            <CollapsibleContent>
                <div
                    className={cn(
                        "transition-[margin,padding,border-color] duration-200 motion-reduce:transition-none",
                        headerOpen
                            ? "mt-4 border-t pt-4"
                            : "mt-0 border-t border-transparent pt-0"
                    )}
                >
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};

// A small title that takes the place of the header while it is hidden.
const HeaderlessTitle = ({
    open,
    title,
}: {
    open: boolean;
    title?: string;
}) => {
    if (!title) return null;

    return (
        <AnimatedCollapse open={open}>
            <p className="pb-4 text-sm leading-snug font-medium">{title}</p>
        </AnimatedCollapse>
    );
};
