import type { ACTIONS, RESOURCES } from "../consts/resources";

export type Resource = (typeof RESOURCES)[number];
export type Action = (typeof ACTIONS)[number];
