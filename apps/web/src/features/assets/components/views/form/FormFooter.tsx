import { Button } from "@/components/ui/button";

type Props = {
    submitLabel: string;
    isSubmitting: boolean;
    // False keeps the send button blocked. Defaults to true.
    canSubmit?: boolean;
    onCancel: () => void;
};

// The buttons that close a form: give up, or send it.
export const FormFooter = ({
    submitLabel,
    isSubmitting,
    canSubmit = true,
    onCancel,
}: Props) => (
    <div className="flex justify-end gap-2">
        <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
        >
            Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !canSubmit}>
            {submitLabel}
        </Button>
    </div>
);
