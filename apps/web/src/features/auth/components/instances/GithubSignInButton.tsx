import { GithubLogoIcon } from "@/components/logos";
import { Button } from "@/components/ui/button";
import { useAuthProviders } from "../../queries/getAuthProviders";
import { buildGithubStartUrl } from "../../lib/buildGithubStartUrl";

// A link, not a mutation: the browser leaves for the API, then for GitHub, and
// comes back already signed in. It is the same in the sign up and the sign in.
export function GithubSignInButton() {
    const { data } = useAuthProviders();

    if (!data?.github) return null;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                ou
                <span className="h-px flex-1 bg-border" />
            </div>
            <Button
                variant="outline"
                size="lg"
                icon={GithubLogoIcon}
                render={<a href={buildGithubStartUrl()} />}
            >
                Entrar com GitHub
            </Button>
        </div>
    );
}
