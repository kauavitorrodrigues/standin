import { Button } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";

type Props = {
    label: string;
    selected: boolean;
    onSelect: () => void;
};

// One text button of a carousel strip, for items that have no icon.
export const CarouselTextItem = ({ label, selected, onSelect }: Props) => (
    <CarouselItem className="basis-auto pl-1">
        <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-pressed={selected}
            onClick={onSelect}
            className="aria-pressed:bg-muted aria-pressed:text-foreground text-muted-foreground"
        >
            {label}
        </Button>
    </CarouselItem>
);
