import { CarouselButton } from "@/features/spaces/components/pages/space-page/stage/CarouselButton";

type CarouselControlsProps = {
    carouselIndex: number;
    pageCount: number;
    direction: "previous" | "next";
    onClick: () => void;
};

const hasPage = (
    direction: CarouselControlsProps["direction"],
    carouselIndex: number,
    pageCount: number
): boolean => {
    switch (direction) {
        case "next":
            return carouselIndex < pageCount - 1;
        case "previous":
            return carouselIndex > 0;
    }
};

// Only rendered when there is more than one page.
export const CarouselControls = ({
    carouselIndex,
    pageCount,
    direction,
    onClick,
}: CarouselControlsProps) => {
    if (pageCount <= 1) return null;

    const isEnabled = hasPage(direction, carouselIndex, pageCount);

    return (
        <CarouselButton
            direction={direction}
            isEnabled={isEnabled}
            onClick={onClick}
        />
    );
};
