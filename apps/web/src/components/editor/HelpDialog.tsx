import type { ReactNode } from "react";
import { CircleHelpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HelpTab = {
    value: string;
    label: string;
    content: ReactNode;
};

type Props = {
    title: string;
    tabs: readonly [HelpTab, ...HelpTab[]];
};

// How an editor works, in a dialog split in tabs so each one says little. The
// "?" that opens it goes at the end of a toolbar. The editor gives the tabs.
export const HelpDialog = ({ title, tabs }: Props) => (
    <Dialog>
        <DialogTrigger
            render={
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Ajuda do editor"
                />
            }
        >
            <CircleHelpIcon />
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue={tabs[0].value}>
                <TabsList>
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {tabs.map((tab) => (
                    <TabsContent
                        key={tab.value}
                        value={tab.value}
                        className="min-h-96"
                    >
                        {tab.content}
                    </TabsContent>
                ))}
            </Tabs>
        </DialogContent>
    </Dialog>
);
