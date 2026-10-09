import type { ROLES } from "./enums/roles";

export type Role = (typeof ROLES)[keyof typeof ROLES];
