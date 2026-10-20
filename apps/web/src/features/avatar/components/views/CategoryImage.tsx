import { CATEGORY_IMAGE_SIZE } from "../../consts/editor/grid";

type CategoryImageProps = { previewUrl: string | null };

// The image of a category, beside its name. A category with no image keeps the
// space empty so the names stay aligned.
export const CategoryImage = ({ previewUrl }: CategoryImageProps) => {
    if (previewUrl === null) {
        return (
            <span
                aria-hidden
                className="shrink-0"
                style={{
                    width: CATEGORY_IMAGE_SIZE,
                    height: CATEGORY_IMAGE_SIZE,
                }}
            />
        );
    }

    return (
        <img
            src={previewUrl}
            alt=""
            draggable={false}
            width={CATEGORY_IMAGE_SIZE}
            height={CATEGORY_IMAGE_SIZE}
            className="shrink-0 object-contain [image-rendering:pixelated]"
        />
    );
};
