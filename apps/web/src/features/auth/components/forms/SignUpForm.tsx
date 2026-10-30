import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
    MAX_PASSWORD_LENGTH,
    MAX_USER_EMAIL_LENGTH,
    MAX_USER_NAME_LENGTH,
    UserDataSchema,
    type UserDataSchemaType,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { Button } from "@/components/ui/button";
import { getApiError } from "@/features/assets/utils/getApiError";
import { SIGN_UP_ERROR_MESSAGES } from "../../consts/messages";
import { useSignUp } from "../../mutations/signUp";

type Props = {
    // The token of an organization link: it lets the person in even when sign up
    // is closed, and puts them in that organization.
    inviteToken?: string;
};

const getSignUpErrorMessage = (error: unknown): string => {
    const code = getApiError(error).code;
    if (code && code in SIGN_UP_ERROR_MESSAGES) {
        return SIGN_UP_ERROR_MESSAGES[
            code as keyof typeof SIGN_UP_ERROR_MESSAGES
        ];
    }
    return SIGN_UP_ERROR_MESSAGES.FALLBACK;
};

export function SignUpForm({ inviteToken }: Props) {
    const navigate = useNavigate();
    const signUpMutation = useSignUp();

    const form = useForm<UserDataSchemaType>({
        resolver: zodResolver(UserDataSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const onSubmit = async (data: UserDataSchemaType) => {
        await signUpMutation.mutateAsync(
            { ...data, inviteToken },
            {
                onSuccess: () => navigate({ to: "/home" }),
            }
        );
    };

    const isPending = signUpMutation.isPending;

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-4"
        >
            <TextFormField
                control={form.control}
                name="name"
                label="Nome"
                required
                placeholder="Seu nome"
                disabled={isPending}
                maxLength={MAX_USER_NAME_LENGTH}
            />
            <TextFormField
                control={form.control}
                name="email"
                label="Email"
                required
                type="email"
                placeholder="Seu e-mail"
                disabled={isPending}
                maxLength={MAX_USER_EMAIL_LENGTH}
            />
            <TextFormField
                control={form.control}
                name="password"
                label="Senha"
                required
                type="password"
                placeholder="Sua senha"
                disabled={isPending}
                maxLength={MAX_PASSWORD_LENGTH}
            />
            {signUpMutation.isError && (
                <p className="text-sm text-destructive">
                    {getSignUpErrorMessage(signUpMutation.error)}
                </p>
            )}
            <Button type="submit" size="lg" disabled={isPending}>
                Criar conta
            </Button>
        </form>
    );
}
