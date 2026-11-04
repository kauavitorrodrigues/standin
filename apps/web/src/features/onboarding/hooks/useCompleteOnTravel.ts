import { useEffect } from "react";
import type Phaser from "phaser";
import { ONBOARDING_TASKS } from "@standin/contracts";
import { TRAVEL_EVENTS } from "@/features/game/consts/travel";
import { useCompleteTask } from "./useCompleteTask";

// Walking around the office completes its task, and walking into a common
// area completes the hang out one. The scene decides when each happened, so
// entering the map or a tap on a key does not count.
export function useCompleteOnTravel(game: Phaser.Game | null) {
    const complete = useCompleteTask();

    useEffect(() => {
        if (!game) return;

        const onTraveled = () => complete(ONBOARDING_TASKS.NAVIGATE_OFFICE);
        const onAreaEntered = () => complete(ONBOARDING_TASKS.HANG_OUT);
        game.events.on(TRAVEL_EVENTS.TRAVELED, onTraveled);
        game.events.on(TRAVEL_EVENTS.AREA_ENTERED, onAreaEntered);
        return () => {
            game.events.off(TRAVEL_EVENTS.TRAVELED, onTraveled);
            game.events.off(TRAVEL_EVENTS.AREA_ENTERED, onAreaEntered);
        };
    }, [game, complete]);
}
