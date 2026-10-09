import { ChevronDownIcon } from "lucide-react";
import type { UserSummary } from "@standin/contracts";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PersonItem } from "@/features/spaces/components/pages/space-page/people/PersonItem";

type Props = {
    label: string;
    people: readonly UserSummary[];
    isOnline: boolean;
    selfUserId: string;
};

// A group of people the viewer can fold away, open by default.
export const PeopleSection = ({
    label,
    people,
    isOnline,
    selfUserId,
}: Props) => (
    <Collapsible defaultOpen>
        <CollapsibleTrigger className="group/trigger flex w-full items-center gap-1 rounded-md px-2 pb-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            {label} ({people.length})
            <ChevronDownIcon className="size-3.5 -rotate-90 transition-transform group-data-panel-open/trigger:rotate-0" />
        </CollapsibleTrigger>
        <CollapsibleContent>
            <ul className="flex flex-col">
                {people.map((person) => (
                    <PersonItem
                        key={person.id}
                        person={person}
                        isOnline={isOnline}
                        isSelf={person.id === selfUserId}
                    />
                ))}
            </ul>
        </CollapsibleContent>
    </Collapsible>
);
