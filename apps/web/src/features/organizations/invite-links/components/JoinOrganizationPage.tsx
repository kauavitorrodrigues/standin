import { Loader2 } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "@/features/auth/components/forms/SignUpForm";
import { SIGN_UP_ERROR_MESSAGES } from "@/features/auth/consts/messages";
import { getApiError } from "@/features/assets/utils/getApiError";
import { useOrganizationInvitePreview } from "../queries/useInvitePreview";

const getPreviewErrorMessage = (error: unknown): string => {
    const code = getApiError(error).code;
    if (code && code in SIGN_UP_ERROR_MESSAGES) {
        return SIGN_UP_ERROR_MESSAGES[
            code as keyof typeof SIGN_UP_ERROR_MESSAGES
        ];
    }
    return "Não foi possível abrir o convite. Tente novamente.";
};

// The page of an organization link: whoever opens it creates an account
// that goes straight into that organization.
export function JoinOrganizationPage({ token }: { token: string }) {
    const {
        data: invite,
        error,
        isLoading,
    } = useOrganizationInvitePreview(token);

    return (
        <div className="flex min-h-dvh w-full items-center justify-center bg-background p-6">
            <Card className="w-full max-w-sm">
                {isLoading && (
                    <CardContent className="flex justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </CardContent>
                )}
                {error && (
                    <CardHeader>
                        <CardTitle>Convite indisponível</CardTitle>
                        <CardDescription>
                            {getPreviewErrorMessage(error)}
                        </CardDescription>
                    </CardHeader>
                )}
                {invite && (
                    <>
                        <CardHeader>
                            <CardTitle>
                                Entrar em {invite.organizationName}
                            </CardTitle>
                            <CardDescription>
                                {invite.inviterName
                                    ? `${invite.inviterName} convidou você. `
                                    : ""}
                                Crie sua conta para entrar na organização.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SignUpForm inviteToken={token} />
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
