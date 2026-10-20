import { PageContainer } from "@/components/layout/page-container";
import { useAvatarCategories } from "../../../queries/admin/useAvatarCategories";
import { CategoriesContent } from "../../instances/admin/CategoriesContent";
import { NewRegistrationButton } from "../../instances/admin/NewRegistrationButton";

export function AvatarCategoriesPage() {
    const { categories, isLoading, isError } = useAvatarCategories();

    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Categorias de avatar"
                description="As categorias do editor de avatar, na ordem em que aparecem. Cada uma tem um nome e uma imagem ao lado dele."
                controls={<NewRegistrationButton />}
            />
            <PageContainer.Content className="flex flex-col gap-6 p-4">
                <CategoriesContent
                    categories={categories}
                    isLoading={isLoading}
                    isError={isError}
                />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
