import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";

type Props = {
    onSubmit?: () => void;
    onClose?: () => void;
    isSubmitting: boolean;
    submitDisabled?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
    submitVariant?: ButtonProps["variant"];
};

export const FormDialogControls = ({
    onSubmit,
    onClose,
    isSubmitting,
    submitDisabled = false,
    submitLabel = "Salvar",
    cancelLabel = "Cancelar",
    submitVariant,
}: Props) => {
    return (
        <DialogFooter className="sm:flex-row sm:justify-end">
            <DialogClose
                render={
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={onClose}
                    />
                }
            >
                {cancelLabel}
            </DialogClose>
            <SubmitButton
                onSubmit={onSubmit}
                disabled={isSubmitting || submitDisabled}
                variant={submitVariant}
                label={submitLabel}
            />
        </DialogFooter>
    );
};

type SubmitButtonProps = {
    onSubmit?: () => void;
    disabled: boolean;
    variant?: ButtonProps["variant"];
    label: string;
};

const SubmitButton = ({
    onSubmit,
    disabled,
    variant,
    label,
}: SubmitButtonProps) => {
    if (onSubmit) {
        return (
            <Button
                type="button"
                disabled={disabled}
                variant={variant}
                onClick={onSubmit}
            >
                {label}
            </Button>
        );
    }

    return (
        <Button type="submit" disabled={disabled} variant={variant}>
            {label}
        </Button>
    );
};
