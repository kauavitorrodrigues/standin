import { ORGANIZATION_PAGE_LIBRARY } from "../../consts/library";
import { SoundboardLibraryPage } from "../instances/SoundboardLibraryPage";

// The sounds of the organization in its library, next to the assets, the
// tilesets and the areas: its own clips in a single table.
export function SoundsPage() {
    return (
        <SoundboardLibraryPage
            library={ORGANIZATION_PAGE_LIBRARY}
            description="Os sons que todos da organização tocam nas chamadas."
        />
    );
}
