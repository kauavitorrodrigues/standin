import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JOIN_TEXTS } from "../../consts/messages";

export function JoinError({ message }: { message: string }) {
    return (
        <CardHeader>
            <CardTitle>{JOIN_TEXTS.unavailableTitle}</CardTitle>
            <CardDescription>{message}</CardDescription>
        </CardHeader>
    );
}
