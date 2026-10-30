import { ADMIN_PAGE_LIBRARY } from "../../consts/library";
import { SoundboardLibraryPage } from "../instances/SoundboardLibraryPage";

// The default sounds, which every organization sees, managed by the platform
// admin: the default group alone, and what is uploaded here is a default clip.
export function AdminSoundsPage() {
    return (
        <SoundboardLibraryPage
            library={ADMIN_PAGE_LIBRARY}
            description="Os sons padrão, que toda organização pode tocar nas chamadas."
        />
    );
}
