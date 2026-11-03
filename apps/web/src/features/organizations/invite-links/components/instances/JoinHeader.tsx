import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
    organizationName: string;
    inviterName: string | null;
    description: string;
};

export function JoinHeader({
    organizationName,
    inviterName,
    description,
}: Props) {
    return (
        <CardHeader>
            <CardTitle>Entrar em {organizationName}</CardTitle>
            <CardDescription>
                {inviterName ? `${inviterName} convidou você. ` : ""}
                {description}
            </CardDescription>
        </CardHeader>
    );
}
