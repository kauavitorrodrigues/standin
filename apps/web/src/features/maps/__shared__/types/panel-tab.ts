import type { PANEL_TABS } from "@/features/maps/__shared__/consts/panelTabs";

export type PanelTab = (typeof PANEL_TABS)[keyof typeof PANEL_TABS];
