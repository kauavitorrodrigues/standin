import type { UserSummary } from "@standin/contracts";
import { PeopleEmptyState } from "@/features/spaces/components/pages/space-page/people/ContentStates";
import { PeopleSection } from "@/features/spaces/components/pages/space-page/people/PeopleSection";

type Props = {
    online: readonly UserSummary[];
    offline: readonly UserSummary[];
    selfUserId: string;
};

export const PeopleList = ({ online, offline, selfUserId }: Props) => {
    if (online.length === 0 && offline.length === 0) {
        return <PeopleEmptyState />;
    }

    return (
        <div className="flex flex-col gap-3">
            {online.length > 0 && (
                <PeopleSection
                    label="Online"
                    people={online}
                    isOnline
                    selfUserId={selfUserId}
                />
            )}
            {offline.length > 0 && (
                <PeopleSection
                    label="Offline"
                    people={offline}
                    isOnline={false}
                    selfUserId={selfUserId}
                />
            )}
        </div>
    );
};
