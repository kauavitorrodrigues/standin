import { useState } from "react";

import type { SpotifyOwnerStatus } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { AppDialogBody } from "@/features/integrations/components/views/dialog/Body";
import { AppDialogFooter } from "@/features/integrations/components/views/dialog/Footer";
import { StepNav } from "@/features/integrations/components/views/stepper/Nav";
import { useCopyText } from "@/features/integrations/hooks/useCopyText";
import { SpotifyMessages } from "../../consts/messages";
import { SPOTIFY_SETUP_STEPS } from "../../consts/setupSteps";
import { SpotifyMutations } from "../../mutations";
import { getInitialStepIndex } from "../../utils/getInitialStepIndex";
import { getNextFormId } from "../../utils/getNextFormId";
import { getRemovingUserId } from "../../utils/getRemovingUserId";
import { getRemoveAppLabel } from "../../utils/labels";
import { SaveSpotifyAppForm } from "../forms/SaveAppForm";
import { SpotifyCredentialsStep } from "../views/setup/CredentialsStep";
import { SpotifyDoneStep } from "../views/setup/DoneStep";
import { SpotifyIntroStep } from "../views/setup/IntroStep";
import { SpotifyRedirectStep } from "../views/setup/RedirectStep";

type Props = {
    organizationId: string;
    status: SpotifyOwnerStatus;
};

const LAST_STEP_INDEX = SPOTIFY_SETUP_STEPS.length - 1;

// The setup of the Spotify app in steps: what is needed, the address to
// register, the credentials and the summary. A saved app opens on the summary.
export const SpotifySetupSteps = ({ organizationId, status }: Props) => {
    const [stepIndex, setStepIndex] = useState(() =>
        getInitialStepIndex(status.isConfigured)
    );
    const [isCredentialsReady, setIsCredentialsReady] = useState(false);
    const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false);
    const removePerson = SpotifyMutations.removePerson(organizationId);
    const removeApp = SpotifyMutations.removeApp(organizationId);
    const redirect = useCopyText(status.redirectUri);

    const step = SPOTIFY_SETUP_STEPS[stepIndex];
    // Next on the credentials step saves them, so it waits for both fields.
    const canGoNext =
        stepIndex < LAST_STEP_INDEX &&
        (step.value !== "credentials" || isCredentialsReady);

    const handleRemovePerson = (userId: string) =>
        removePerson.mutate(userId, {
            onError: () =>
                toast.add({
                    title: SpotifyMessages.removePersonFailed,
                    type: "error",
                }),
        });

    const handleRemoveApp = () => {
        if (!isConfirmingRemoval) return setIsConfirmingRemoval(true);

        removeApp.mutate(undefined, {
            onSuccess: () => setStepIndex(0),
            onSettled: () => setIsConfirmingRemoval(false),
            onError: () =>
                toast.add({
                    title: SpotifyMessages.removeAppFailed,
                    type: "error",
                }),
        });
    };

    const renderStep = () => {
        switch (step.value) {
            case "intro":
                return <SpotifyIntroStep />;
            case "redirect":
                return (
                    <SpotifyRedirectStep
                        uri={status.redirectUri}
                        copied={redirect.copied}
                        onCopy={redirect.copy}
                    />
                );
            case "credentials":
                return (
                    <SpotifyCredentialsStep>
                        <SaveSpotifyAppForm
                            key={status.clientId ?? "empty"}
                            organizationId={organizationId}
                            savedClientId={status.clientId}
                            onSaved={() => setStepIndex(LAST_STEP_INDEX)}
                            onReadyChange={setIsCredentialsReady}
                        />
                    </SpotifyCredentialsStep>
                );
            case "done":
                return (
                    <SpotifyDoneStep
                        connections={status.connections}
                        maxConnections={status.maxConnections}
                        removingUserId={getRemovingUserId(removePerson)}
                        isRemovingApp={removeApp.isPending}
                        removeAppLabel={getRemoveAppLabel(isConfirmingRemoval)}
                        onRemovePerson={handleRemovePerson}
                        onRemoveApp={handleRemoveApp}
                    />
                );
        }
    };

    return (
        <>
            <AppDialogBody>
                {/* Same height on every step, so the footer does not jump. */}
                <div className="min-h-[26rem]">{renderStep()}</div>
            </AppDialogBody>
            <AppDialogFooter>
                <div className="flex-1">
                    <StepNav
                        steps={[...SPOTIFY_SETUP_STEPS]}
                        currentIndex={stepIndex}
                        canGoBack={stepIndex > 0}
                        canGoNext={canGoNext}
                        isLastStep={stepIndex === LAST_STEP_INDEX}
                        nextFormId={getNextFormId(step.value)}
                        onBack={() => setStepIndex(stepIndex - 1)}
                        onNext={() => setStepIndex(stepIndex + 1)}
                    />
                </div>
            </AppDialogFooter>
        </>
    );
};
