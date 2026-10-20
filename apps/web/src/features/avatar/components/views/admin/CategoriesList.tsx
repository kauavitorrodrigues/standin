import type { AvatarCategory } from "@standin/contracts";
import { CategoryRow } from "./CategoryRow";

type Props = { categories: AvatarCategory[] };

export const CategoriesList = ({ categories }: Props) => (
    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
            <CategoryRow key={category.slot} category={category} />
        ))}
    </ul>
);
