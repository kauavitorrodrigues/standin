import { SIZE_TIERS, type SizeTier } from "@standin/contracts";

// The group of people a tier is made for, like "7-10 pessoas".
export const getTierPeopleLabel = (tier: SizeTier): string => {
    const { minPeople, maxPeople } = SIZE_TIERS[tier];
    return `${minPeople}-${maxPeople} pessoas`;
};
