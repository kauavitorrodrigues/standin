import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

type Props<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = {
    control: Control<TFieldValues>;
    name: TName;
    // Only a reply can also be sent to the channel.
    isThreadReply: boolean;
    disabled?: boolean;
};

// The reply stays in its thread and also shows in the main list.
export function ShowInChannelField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({ control, name, isThreadReply, disabled }: Props<TFieldValues, TName>) {
    if (!isThreadReply) return null;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                        type="checkbox"
                        ref={field.ref}
                        name={field.name}
                        checked={field.value === true}
                        onChange={(event) => field.onChange(event.target.checked)}
                        onBlur={field.onBlur}
                        disabled={disabled}
                    />
                    Também enviar para o canal
                </label>
            )}
        />
    );
}
