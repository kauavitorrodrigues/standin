import { ANNOUNCING_VERBS } from "../consts/announcingBanner";

const pluralRules = new Intl.PluralRules("pt-BR");

// The verb that agrees with how many people are announcing.
export const resolveAnnouncingVerb = (count: number): string =>
    ANNOUNCING_VERBS[pluralRules.select(count)];
