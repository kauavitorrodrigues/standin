import { InfoIcon, XIcon } from "lucide-react";
import { useState } from "react";
import {
    EMBEDDED_WEBSITE_MODES,
    validateBehaviorParams,
} from "@standin/contracts";
import type { EmbeddedWebsiteParams } from "@standin/contracts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BEHAVIOR_MESSAGES as Messages } from "@/features/editor/consts/messages";
import { fromBehaviorDraft } from "@/features/editor/utils/fromBehaviorDraft";
import { toBehaviorDraft } from "@/features/editor/utils/toBehaviorDraft";

type BehaviorFormProps = {
    params: EmbeddedWebsiteParams | null;
    onSubmit: (params: EmbeddedWebsiteParams | null) => void;
};

const MODES = [
    { value: EMBEDDED_WEBSITE_MODES.URL, label: Messages.MODE_URL },
    { value: EMBEDDED_WEBSITE_MODES.DERIVED, label: Messages.MODE_DERIVED },
] as const;

// The website of an object whose asset embeds one. Changing the mode starts
// from an empty field, so nothing typed for the other mode is sent.
export const BehaviorForm = ({ params, onSubmit }: BehaviorFormProps) => {
    const [draft, setDraft] = useState(() => toBehaviorDraft(params));
    const [invalid, setInvalid] = useState(false);

    const isUrl = draft.mode === EMBEDDED_WEBSITE_MODES.URL;

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const next = fromBehaviorDraft(draft);
        const result = validateBehaviorParams(next, {
            appOrigins: [window.location.origin],
        });
        setInvalid(!result.ok);
        if (result.ok) onSubmit(next);
    };

    const handleClear = () => {
        setInvalid(false);
        setDraft(toBehaviorDraft(null));
        onSubmit(null);
    };

    return (
        <form onSubmit={handleSubmit} className="flex w-80 flex-col gap-3">
            <div className="flex gap-1">
                {MODES.map(({ value, label }) => (
                    <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant={draft.mode === value ? "secondary" : "ghost"}
                        onClick={() => {
                            setInvalid(false);
                            setDraft({ mode: value, text: "" });
                        }}
                    >
                        {label}
                    </Button>
                ))}
            </div>
            <div className="flex items-center gap-1.5">
                <Input
                    aria-label={
                        isUrl ? Messages.URL_LABEL : Messages.PREFIX_LABEL
                    }
                    aria-invalid={invalid}
                    placeholder={Messages.URL_PLACEHOLDER}
                    value={draft.text}
                    onChange={(event) =>
                        setDraft({ ...draft, text: event.target.value })
                    }
                />
                <Button type="submit" size="default">
                    {Messages.APPLY}
                </Button>
                {params && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={Messages.CLEAR}
                        onClick={handleClear}
                    >
                        <XIcon />
                    </Button>
                )}
            </div>
            {invalid && (
                <p className="text-destructive text-xs">{Messages.INVALID}</p>
            )}
            {!isUrl && (
                <Alert>
                    <InfoIcon />
                    <AlertDescription>{Messages.PREFIX_HINT}</AlertDescription>
                </Alert>
            )}
        </form>
    );
};
