import type { ReactNode } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDownIcon } from "lucide-react";

type Props = { title: string; children: ReactNode };

export const Section = ({ title, children }: Props) => (
    <Collapsible.Root defaultOpen className="flex flex-col gap-0.5">
        <Collapsible.Trigger className="group/section flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring/50">
            {title}
            <ChevronDownIcon className="size-3 transition-transform group-data-[panel-open]/section:rotate-0 -rotate-90" />
        </Collapsible.Trigger>
        <Collapsible.Panel className="flex flex-col gap-0.5">
            {children}
        </Collapsible.Panel>
    </Collapsible.Root>
);
