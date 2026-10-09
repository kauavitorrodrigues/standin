import type { UserSummary } from "@standin/contracts";
import { PeopleSection } from "@/features/spaces/components/pages/space-page/people/PeopleSection";

type Props = {
    online: readonly UserSummary[];
    offline: readonly UserSummary[];
    selfUserId: string;
};

export const PeopleList = ({ online, offline, selfUserId }: Props) => {
    if (online.length === 0 && offline.length === 0) {
        return (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                Ninguém encontrado
            </p>
        );
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
