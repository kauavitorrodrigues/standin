import { Link } from "@tanstack/react-router";
import { rememberReturnPath } from "@/features/auth/lib/returnTo";
import { buildJoinPath } from "../../utils/link";
import { JOIN_TEXTS } from "../../consts/messages";

// The login sends the person back here once they are signed in.
export function HaveAccountLink({ token }: { token: string }) {
    return (
        <Link
            to="/"
            onClick={() => rememberReturnPath(buildJoinPath(token))}
            className="text-sm text-muted-foreground underline underline-offset-4"
        >
            {JOIN_TEXTS.haveAccount}
        </Link>
    );
}
