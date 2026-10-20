import { useFormContext, useWatch } from "react-hook-form";
import type { AvatarSlot } from "@standin/contracts";
import type { AvatarEditorFormValues } from "../../types/draft";
import type { AvatarEditorCategory } from "../../types/editor";
import { CategoryTab } from "../views/CategoryTab";

type CategoryListFieldProps = {
    categories: readonly AvatarEditorCategory[];
};

// The categories of the editor, in the order the server sends them.
export const CategoryListField = ({ categories }: CategoryListFieldProps) => {
    const { control, setValue } = useFormContext<AvatarEditorFormValues>();
    const activeSlot = useWatch({ control, name: "activeSlot" });

    const select = (slot: AvatarSlot) => setValue("activeSlot", slot);

    return (
        <>
            {categories.map((category) => (
                <CategoryTab
                    key={category.slot}
                    category={category}
                    isActive={category.slot === activeSlot}
                    onSelect={select}
                />
            ))}
        </>
    );
};
