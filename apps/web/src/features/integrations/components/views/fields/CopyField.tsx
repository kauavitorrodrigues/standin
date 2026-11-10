import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCopyLabel } from "@/features/integrations/utils/getCopyLabel";

type Props = {
    label: string;
    text: string;
    copied: boolean;
    onCopy: () => void;
};

// A value to copy, with its label and a button.
export const CopyField = ({ label, text, copied, onCopy }: Props) => (
    <div className="flex flex-col gap-1.5">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
            <Input readOnly value={text} aria-label={label} />
            <Button type="button" variant="outline" onClick={onCopy}>
                {getCopyLabel(copied)}
            </Button>
        </div>
    </div>
);
