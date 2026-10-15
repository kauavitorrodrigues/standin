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
import { TileHelpCategories } from "./Categories";
import { TileHelpShortcuts } from "./Shortcuts";
import { TileHelpTools } from "./Tools";

// How the editor works, in a dialog split in tabs so each one says little: the
// tools, the categories, and the keys and the mouse. The "?" that opens it sits
// at the end of the tools.
export const TileToolHelp = () => (
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
                <DialogTitle>Como usar o editor</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="tools">
                <TabsList>
                    <TabsTrigger value="tools">Ferramentas</TabsTrigger>
                    <TabsTrigger value="categories">Categorias</TabsTrigger>
                    <TabsTrigger value="shortcuts">Teclado e mouse</TabsTrigger>
                </TabsList>
                <TabsContent value="tools" className="min-h-96">
                    <TileHelpTools />
                </TabsContent>
                <TabsContent value="categories" className="min-h-96">
                    <TileHelpCategories />
                </TabsContent>
                <TabsContent value="shortcuts" className="min-h-96">
                    <TileHelpShortcuts />
                </TabsContent>
            </Tabs>
        </DialogContent>
    </Dialog>
);
