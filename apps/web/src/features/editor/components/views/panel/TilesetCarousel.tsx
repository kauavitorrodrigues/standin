import type { Tileset } from "@standin/contracts";
import { CarouselStrip } from "@/features/editor/components/views/CarouselStrip";
import { CarouselTextItem } from "@/features/editor/components/views/CarouselTextItem";

type TilesetCarouselProps = {
    tilesets: Tileset[];
    selectedId: string;
    onSelect: (tilesetId: string) => void;
};

// One text button per tileset, or the reason there is none.
export const TilesetCarousel = ({
    tilesets,
    selectedId,
    onSelect,
}: TilesetCarouselProps) => {
    if (tilesets.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                Nenhum tileset encontrado.
            </p>
        );
    }

    return (
        <CarouselStrip>
            {tilesets.map(({ id, name }) => (
                <CarouselTextItem
                    key={id}
                    label={name}
                    selected={id === selectedId}
                    onSelect={() => onSelect(id)}
                />
            ))}
        </CarouselStrip>
    );
};
