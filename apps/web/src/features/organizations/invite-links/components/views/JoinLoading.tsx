import { Loader2 } from "lucide-react";
import { CardContent } from "@/components/ui/card";

export function JoinLoading() {
    return (
        <CardContent className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
    );
}
