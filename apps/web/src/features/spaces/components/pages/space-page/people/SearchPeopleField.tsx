import { SearchIcon } from "lucide-react";
import type { Control } from "react-hook-form";
import { GenericFormField } from "@/components/fields/GenericFormField";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { getModShortcutKeys } from "@/utils/getModShortcutKeys";
import { SEARCH_SHORTCUT_KEY } from "@/features/spaces/consts/peoplePanel";
import type { SearchPeopleValues } from "@/features/spaces/schemas/searchPeople";

export const SearchPeopleField = ({
    control,
}: {
    control: Control<SearchPeopleValues>;
}) => (
    <GenericFormField
        control={control}
        name="query"
        render={(field) => (
            <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    {...field}
                    id="query"
                    type="text"
                    autoComplete="off"
                    placeholder="Buscar pessoas"
                    aria-label="Buscar pessoas"
                    className="h-10 rounded-xl border-transparent bg-foreground/5 pr-20 pl-9 dark:bg-foreground/5"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 gap-1">
                    {getModShortcutKeys(SEARCH_SHORTCUT_KEY).map((key) => (
                        <Kbd
                            key={key}
                            className="bg-foreground/10 text-muted-foreground"
                        >
                            {key}
                        </Kbd>
                    ))}
                </span>
            </div>
        )}
    />
);
