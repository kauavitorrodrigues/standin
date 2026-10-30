import { PageContainer } from "@/components/layout/page-container";
import { useSoundboardSearch } from "../../hooks/useSoundboardSearch";
import type { SoundboardLibrary } from "../../types/library";
import { ClipSearchField } from "../views/list/SearchField";
import { ClipUpload } from "./ClipUpload";
import { TABLE_LIST_LAYOUT } from "./listLayouts";
import { SoundboardLibraryContent } from "./SoundboardLibraryContent";
import { SoundboardLibraryProvider } from "./SoundboardLibraryProvider";

type Props = { library: SoundboardLibrary; description: string };

// A management page of a library, whichever it is, with the clips as a table.
// The header holds what works on the list: the search and the upload, at the
// right. The search is lifted here, so the list below reads the same one.
export const SoundboardLibraryPage = ({ library, description }: Props) => {
    const { searchForm, search, hasSearch } = useSoundboardSearch();

    return (
        <SoundboardLibraryProvider library={library}>
            <PageContainer.Root>
                <PageContainer.Header
                    title="Sons"
                    description={description}
                    controls={
                        <PageContainer.Controls>
                            <ClipSearchField
                                form={searchForm}
                                className="w-64 flex-none"
                            />
                            <ClipUpload />
                        </PageContainer.Controls>
                    }
                />
                <PageContainer.Content>
                    <SoundboardLibraryContent
                        search={search}
                        hasSearch={hasSearch}
                        layout={TABLE_LIST_LAYOUT}
                    />
                </PageContainer.Content>
            </PageContainer.Root>
        </SoundboardLibraryProvider>
    );
};
