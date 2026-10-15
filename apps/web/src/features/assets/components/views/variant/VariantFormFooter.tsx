import { Button } from "@/components/ui/button";

type Props = {
    isSubmitting: boolean;
    onCancel: () => void;
};

export const VariantFormFooter = ({ isSubmitting, onCancel }: Props) => (
    <div className="flex justify-end gap-2">
        <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
        >
            Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
            Criar variação
        </Button>
    </div>
);
