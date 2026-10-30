import { isServiceTokenScope } from "@standin/contracts";
import { Badge } from "@/components/ui/badge";
import { getScopeMeta } from "../../utils/getScopeMeta";

// The API sends strings: one that is no longer a known scope is skipped, so a
// renamed or removed scope never breaks the list.
type Props = { scopes: readonly string[] };

// The scopes of a token, one outline badge each.
export const ScopeBadges = ({ scopes }: Props) => (
    <div className="flex flex-wrap gap-1">
        {scopes.filter(isServiceTokenScope).map((scope) => {
            const { icon: Icon, label } = getScopeMeta(scope);
            return (
                <Badge key={scope} variant="outline">
                    <Icon aria-hidden />
                    {label}
                </Badge>
            );
        })}
    </div>
);
