import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { OrganizationsQueries } from "@/features/organizations/queries";
import {
    PEOPLE_PANEL_WIDTH_REM,
} from "@/features/spaces/consts/peoplePanel";
import {
    searchPeopleSchema,
    type SearchPeopleValues,
} from "@/features/spaces/schemas/searchPeople";
import { useSearchHotkey } from "@/features/spaces/hooks/useSearchHotkey";
import { splitPeopleByPresence } from "@/features/spaces/utils/splitPeopleByPresence";
import { SearchPeopleField } from "@/features/spaces/components/pages/space-page/people/SearchPeopleField";
import { SidePanel } from "@/components/layout/SidePanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PeopleList } from "@/features/spaces/components/pages/space-page/people/PeopleList";

type Props = {
    spaceName: string;
    onlineUserIds: readonly string[];
    isClosing: boolean;
    onClose: () => void;
};

// Who is in the space, docked next to the rail.
export const PeoplePanel = ({
    spaceName,
    onlineUserIds,
    isClosing,
    onClose,
}: Props) => {
    const { user } = useAuth();
    const { members } = OrganizationsQueries.useMembers();
    const { control, setFocus } = useForm<SearchPeopleValues>({
        resolver: zodResolver(searchPeopleSchema),
        defaultValues: { query: "" },
    });
    useSearchHotkey(() => setFocus("query"));
    const query = useWatch({ control, name: "query" });

    const { online, offline } = splitPeopleByPresence(
        members,
        onlineUserIds,
        query
    );

    return (
        <SidePanel
            title={spaceName || "Pessoas"}
            closeLabel="Fechar painel"
            onClose={onClose}
            isClosing={isClosing}
            width={`${PEOPLE_PANEL_WIDTH_REM}rem`}
        >
            <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-3 px-4 pb-4">
                    <SearchPeopleField control={control} />
                    <PeopleList
                        online={online}
                        offline={offline}
                        selfUserId={user.id}
                    />
                </div>
            </ScrollArea>
        </SidePanel>
    );
};
