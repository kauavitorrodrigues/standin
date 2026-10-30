import type { ServiceTokenScope } from "@standin/contracts";
import { Badge } from "@/components/ui/badge";
import { SERVICE_TOKEN_SCOPE_META } from "../../consts/scopes";

type Props = { scopes: readonly ServiceTokenScope[] };

// The resources a token can write to, one outline badge each.
export const ScopeBadges = ({ scopes }: Props) => (
    <div className="flex flex-wrap gap-1">
        {scopes.map((scope) => {
            const { icon: Icon, label } = SERVICE_TOKEN_SCOPE_META[scope];
            return (
                <Badge key={scope} variant="outline">
                    <Icon aria-hidden />
                    {label}
                </Badge>
            );
        })}
    </div>
);
